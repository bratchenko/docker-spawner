module.exports = ShipyardDestination;

var
    Q = require('q'),
    util = require('util'),
    request = require('request');

function ShipyardDestination(spawn, service, destination, serviceDestination) {
    this._spawn = spawn;
    this._service = service;
    this._destination = destination;
    this._serviceDestination = serviceDestination;
}

ShipyardDestination.prototype.spawn = function*() {
    this._log("Deploying service %s (%s)", this._service.name, this._service._id);

    yield this._pullImage();
    this._log("...image pulled");

    yield this._startContainer();
    this._log("...container started (id " + this._shipyardContainerId + ")");

    yield this._waitUntilContainerIsSynced();
    this._log("...container synced");

    yield this._createOrUpdateApplication();
    this._log("...application updated");

    yield this._removeOldContainers();
    this._log("...old containers removed");

    this._log("Done!");
};

ShipyardDestination.prototype._log = function() {
    var message = util.format.apply(util, arguments);
    this._spawn.addLogRecord(message);
    console.log(message);
};

ShipyardDestination.prototype._pullImage = function() {
    var self = this;
    return this._makeDockerApiRequest(
        "POST",
        "/images/create?fromImage=" + this._getImageName() + "&tag=" + this._getImageTag()
    ).then(function(res) {
        self._log(res);
    });
};

ShipyardDestination.prototype._startContainer = function() {
    var self = this;

    var envVariables = this._collectEnvironmentVariables();

    var data = {
        image: this._getImageName() + ':' + this._getImageTag(),
        description: this._getShipyardDescription(),
        environment: envVariables,
        ports: [this._getServiceBackendPort().toString()],
        hosts: ["/api/v1/hosts/" + this._getShipyardHostId() + "/"]
    };

    return this._makeShipyardApiRequest("POST", "/containers/", data)
        .then(function(response) {
            self._shipyardContainerId = response.id;
        });
};

ShipyardDestination.prototype._waitUntilContainerIsSynced = function() {

    var self = this;
    var maxSyncTime = 10000;
    var startTime = Date.now();
    var deferred = Q.defer();

    var checkIfSynced = function() {
        self._makeShipyardApiRequest("GET", "/containers/" + self._shipyardContainerId + "/")
            .then(function(response) {
                if (response.synced) {
                    deferred.resolve();
                } else {
                    if (Date.now() - startTime < maxSyncTime) {
                        setTimeout(checkIfSynced, 1000);
                    } else {
                        deferred.reject(new Error('Container is taking too long (> '+maxSyncTime+'ms) to sync'));
                    }
                }
            });
    };

    checkIfSynced();

    return deferred.promise;
};

ShipyardDestination.prototype._createOrUpdateApplication = function() {
    var self = this;
    return self._findShipyardApplication()
        .then(function(applicationId) {
            if (applicationId) {
                return self._updateShipyardApplication(applicationId);
            } else {
                return self._createShipyardAppliction();
            }
        });
};

ShipyardDestination.prototype._removeOldContainers = function() {
    var self = this;

    return this._makeShipyardApiRequest("GET", "/containers/?limit=10000")
        .then(function(response) {
            var toDestroy = [];
            response.objects.forEach(function(container) {
                if (container.description === self._getShipyardDescription() && container.id !== self._shipyardContainerId) {
                    toDestroy.push(container.id);
                }
            });

            if (toDestroy.length) {
                self._log("...destroying old containers ", toDestroy);
            }

            var destroyPromises = [];
            toDestroy.forEach(function(containerId) {
                destroyPromises.push(
                    self._makeShipyardApiRequest("GET", "/containers/" + containerId + "/destroy/")
                );
            });
            return Q.all(destroyPromises);
        });
};

ShipyardDestination.prototype._findShipyardApplication = function() {
    var self = this;
    return self._makeShipyardApiRequest("GET", "/applications/?limit=10000")
        .then(function(response) {
            var foundId;
            response.objects.forEach(function(application) {
                if (application.domain_name === self._getServiceDomain()) {
                    foundId = application.id;
                }
            });
            return foundId;
        });
};

ShipyardDestination.prototype._createShipyardAppliction = function() {
    return this._makeShipyardApiRequest("POST", "/applications/", {
        'name': this._getShipyardDescription(),
        'domain_name': this._getServiceDomain(),
        'protocol': "http",
        'backend_port': this._getServiceBackendPort(),
        'containers': [
            "/api/v1/containers/" + this._shipyardContainerId + "/"
        ]
    });
};

ShipyardDestination.prototype._updateShipyardApplication = function(applicationId) {
    return this._makeShipyardApiRequest("PUT", "/applications/" + applicationId + "/", {
        'name': this._getShipyardDescription(),
        'domain_name': this._getServiceDomain(),
        'protocol': "http",
        'backend_port': this._getServiceBackendPort(),
        'containers': [
            "/api/v1/containers/" + this._shipyardContainerId + "/"
        ]
    });
};

ShipyardDestination.prototype._makeShipyardApiRequest = function(method, url, data) {
    return Q.ninvoke(request, method.toLowerCase(), {
        url: this._getShipyardApiUrl() + url,
        headers: this._getShipyardHeaders(),
        json: data || true,
        timeout: 10000,
    })
    .spread(this._processApiResponse.bind(this));
};

ShipyardDestination.prototype._makeDockerApiRequest = function(method, url, data) {
    return Q.ninvoke(request, method.toLowerCase(), {
        url: this._getDockerApiUrl() + url,
        json: data || true,
        timeout: 10000
    })
    .spread(this._processApiResponse.bind(this));
};


ShipyardDestination.prototype._processApiResponse = function(response, body) {
    if (response.statusCode === 204) {
        return null;
    } else if (response.statusCode >= 200 && response.statusCode < 300) {
        return body;
    } else {
        var error = new Error("Unexpected API response: " + JSON.stringify(body));
        throw error;
    }
};

ShipyardDestination.prototype._getShipyardHostId = function() {
    return this._destination.parameters.hostId;
};

ShipyardDestination.prototype._getShipyardApiUrl = function() {
    return this._destination.parameters.url;
};

ShipyardDestination.prototype._getShipyardUsername = function() {
    return this._destination.parameters.username;
};

ShipyardDestination.prototype._getShipyardKey = function() {
    return this._destination.parameters.secretKey;
};

ShipyardDestination.prototype._getDockerApiUrl = function() {
    return this._destination.parameters.dockerUrl;
};

ShipyardDestination.prototype._getShipyardDescription = function() {
    return this._serviceDestination.id; // this._service.name + ' (' + this._serviceDestination.id + ')';
};

ShipyardDestination.prototype._getServiceDomain = function() {
    return this._serviceDestination.parameters.domain;
};

ShipyardDestination.prototype._getServiceBackendPort = function() {
    return this._serviceDestination.parameters.port || 80;
};

ShipyardDestination.prototype._getImageName = function() {
    return this._serviceDestination.imageName ||  this._service.imageName;
};

ShipyardDestination.prototype._getImageTag = function() {
    return this._serviceDestination.imageTag ||  this._service.imageTag;
};

ShipyardDestination.prototype._collectEnvironmentVariables = function() {
    var variables = {};

    if (this._service.variables) {
        this._service.variables.forEach(function(variable) {
            if (variable.name) {
                variables[variable.name] = variable.value;
            }
        });
    }

    if (this._serviceDestination.variables) {
        this._serviceDestination.variables.forEach(function(variable) {
            if (variable.name) {
                variables[variable.name] = variable.value;
            }
        });
    }

    var variableStrings = [];
    for(var name in variables) {
        variableStrings.push(name + '=' + variables[name]);
    }

    return variableStrings;
};

ShipyardDestination.prototype._getShipyardHeaders = function() {
    return {
        'Authorization': 'ApiKey ' + this._getShipyardUsername() + ':' + this._getShipyardKey()
    };
};
