Template.serviceCard.created = function() {
	this.editing = !this.data.name;
	this.editingDep = new Deps.Dependency();
};

Template.serviceCard.deployJob = function() {
	return deployJobs.findOne({"data.serviceId": this._id});
};

Template.serviceCard.helpers({
	isEditing: function() {
		UI._templateInstance().editingDep.depend();
		return UI._templateInstance().editing;
	}
});

Template.serviceCard.events({
	'click .do-edit-service': function(event, template) {
		console.log("View-service-card clicked", template);
		template.editing = true;
		template.editingDep.changed();
	},

	'click .do-save-service': function(event, template) {
		console.log("Save called");
		template.editing = false;
		template.editingDep.changed();

		Services.update({
			_id: this._id
		}, {
			$set: {
				name: template.find('input[name="name"]').value,
				imageName: template.find('input[name="imageName"]').value,
				imageTag: template.find('input[name="imageTag"]').value,
				domain: template.find('input[name="domain"]').value,
			}
		});
	},

	'click .do-delete-service': function() {
		Services.remove({_id: this._id});
	},

	'click .do-deploy-service': function(event) {
		event.stopPropagation();

		Services.update({_id: this._id}, {$set: {deployStatus: 'Starting'}});

		var job = deployJobs.createJob(
			'deployService',
		    {
		      	serviceId: this._id,
		      	status: 'Starting'
		    }
		);

        job.after(new Date(0)); // So that job will be run immediately

		job.save();
	},

	'click .do-stop-deploying-service': function(event, template) {
		event.stopPropagation();


		var jobData = deployJobs.findOne({"data.serviceId": this._id});
		if (jobData) {
			Services.update({_id: this._id}, {$set: {deployStatus: null}});

			var job = deployJobs.makeJob(jobData);
			job.cancel();
			job.remove();
		}
	}
});
