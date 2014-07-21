ServiceDeployer = function(service) {
	//TODO: make it all dynamic
	this._shipyardApiUrl = "http://shipyard.daeq.ru:8000/api/v1";
	this._shipyardApiName = "admin";
	this._shipyardApiSecret = "416a61727e24f5628d6689d6eb4c0e9814da7a65";
	this._hostId = 2;

	this._dockerHost = "http://shipyard.daeq.ru:4243";

	this._service = service;
	this._environment = Environments.findOne({_id: this._service.environmentId});
	this._serviceIdentifier = this._environment.name + '/' + this._service.name;
};

ServiceDeployer.prototype.run = function() {
	console.log("Deploying service ", this._serviceIdentifier);

	this._pullImage();
	console.log("...image pulled");

	this._startContainer();
	console.log("...container started (id "+this._containerId+")");

	this._waitUntilContainerIsSynced();
	console.log("...container synced");

	this._createOrUpdateApplication();
	console.log("...application updated");

	this._removeOldContainerIfExists();
	console.log("...old containers removed");

	console.log("Done!");
};

ServiceDeployer.prototype._pullImage = function() {
	var res = HTTP.post(this._dockerHost + "/images/create?fromImage=" + this._service.imageName + "&tag=" + this._service.imageTag);

	console.log("Pulled image.", res.statusCode, res.content);

	if (res.statusCode !== 200) {
		throw new Error("Unexpected response from Docker Server: " + res.statusCode + "\n" + res.content);
	}
};

ServiceDeployer.prototype._startContainer = function() {
	var envVariables = [];

	if (this._service.variables) {
		this._service.variables.forEach(function(variable) {
			envVariables.push(variable.name + '=' + variable.value);
		});
	}

	var data = {
        image: this._service.imageName + ':' + this._service.imageTag,
        description: this._serviceIdentifier,
        environment: envVariables,
        ports: ["80"],
        hosts: ["/api/v1/hosts/" + this._hostId + "/"]
	};

	var res = HTTP.post(this._shipyardApiUrl + "/containers/", {
		data: data,
		headers: this._getHeaders(),
		timeout: 10000
	});

	if (res.statusCode === 201) {
		this._containerId = res.data.id;
	} else {
		throw new Error("Unexpected from Shipyard: " + res.statusCode + "\n" + res.content);
	}
};

ServiceDeployer.prototype._waitUntilContainerIsSynced = function() {
	var self = this;
	var synced = new Future();
	var checkTimeout = 1000;
	var maxTries = 5;
	var tries = 0;

	var checkIfSynced = function() {
		var res = HTTP.get(self._shipyardApiUrl + "/containers/" + self._containerId + "/", {
			headers: self._getHeaders(),
			timeout: 10000
		});
		if (res.statusCode === 200 && res.data.synced) {
			synced['return']();
		} else {
			if (++tries < maxTries) {
				Meteor.setTimeout(checkIfSynced, checkTimeout);
			} else {
				synced.throw(new Error("Container for service " + self._service.id + " hasn't been synced in time"));
			}
		}
	};

	checkIfSynced();

	return synced.wait();
};

ServiceDeployer.prototype._createOrUpdateApplication = function() {
	var applicationId = this._findShipyardApplication();
	if (applicationId) {
		this._updateShipyardApplication(applicationId);
	} else {
		this._creteShipyardAppliction();
	}
};

ServiceDeployer.prototype._removeOldContainerIfExists = function() {
	var self = this;
	var res = HTTP.get(this._shipyardApiUrl + "/containers/?limit=10000", {
		headers: self._getHeaders(),
		timeout: 10000
	});

	var toDestroy = [];
	res.data.objects.forEach(function(container) {
		if (container.description === self._serviceIdentifier && container.id !== self._containerId) {
			toDestroy.push(container.id);
		}
	});

	toDestroy.forEach(function(containerId) {
		console.log("Destroying container", containerId);
		HTTP.get(self._shipyardApiUrl + "/containers/" + containerId + "/destroy/", {
			headers: self._getHeaders(),
			timeout: 10000
		});
	});
};

ServiceDeployer.prototype._findShipyardApplication = function() {
	var self = this;
	var res = HTTP.get(this._shipyardApiUrl + "/applications/?limit=10000", {
		headers: self._getHeaders(),
		timeout: 10000
	});
	if (res.statusCode === 200) {
		var foundId;
		res.data.objects.forEach(function(application) {
			if (application.domain_name == self._service.domain) {
				foundId = application.id;
			}
		});
		return foundId;
	} else {
		throw new Error("Couldn't get shipyard appliations list: " + res.content);
	}
};

ServiceDeployer.prototype._creteShipyardAppliction = function() {
	var result = HTTP.post(this._shipyardApiUrl + "/applications/", {
		data: {
			name: this._serviceIdentifier,
	  		domain_name: this._service.domain,
	  		protocol: "http",
	  		backend_port: 80,
	  		containers: [
	      		"/api/v1/containers/" + this._containerId + "/"
	   		]
	   	},
	   	headers: this._getHeaders()
	});
	if (result.statusCode !== 201) {
		throw new Error("Couldn't create shipyard application: " + result.statusCode + "\n" + result.content);
	}
};

ServiceDeployer.prototype._updateShipyardApplication = function(applicationId) {
	var result = HTTP.put(this._shipyardApiUrl + "/applications/" + applicationId + "/", {
		data: {
			name: this._serviceIdentifier,
	  		domain_name: this._service.domain,
	  		protocol: "http",
	  		backend_port: 80,
	  		containers: [
	      		"/api/v1/containers/" + this._containerId + "/"
	   		]
	   	},
	   	headers: this._getHeaders()
	});
	if (result.statusCode !== 200) {
		throw new Error("Couldn't update shipyard application: " + result.statusCode + "\n" + result.content);
	}
};

ServiceDeployer.prototype._getHeaders = function() {
	return {
		'Authorization': 'ApiKey ' + this._shipyardApiName + ':' + this._shipyardApiSecret
	};
};