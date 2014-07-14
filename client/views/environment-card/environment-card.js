Template.environmentCard.services = function() {
	return Services.find({environmentId: this._id});
};

Template.environmentCard.events({
	'click .do-save': function(event, template) {
		Environments.update({
			_id: this._id
		}, {
			name: template.find('input[name="name"]').value,
			description: template.find('input[name="description"]').value,
			baseDomain: template.find('input[name="baseDomain"]').value,
			defaultTag: template.find('input[name="defaultTag"]').value
		});
		Router.go('environments');
	},

	'click .do-delete': function(event, template) {
		if (confirm('Sure?')) {
			Environments.remove({_id: this._id});
			Router.go('environments');
		}
	},

	'click .do-add-service': function(event, template) {
		Services.insert({
			environmentId: this._id
		});
	}
});