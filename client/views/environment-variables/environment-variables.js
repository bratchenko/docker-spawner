Template.environmentVariables.created = function() {
	this.editingVariables = [];
	this.editingVariablesDep = new Deps.Dependency();
};

Template.environmentVariables.helpers({
	isEditingVariable: function() {
		UI._templateInstance().editingVariablesDep.depend();
		return UI._templateInstance().editingVariables.indexOf(this.name) !== -1;
	}
});

var deleteVariable = function(environmentId, variableName) {
	Environments.update({
		_id: environmentId
	}, {
		$pull: {
			variables: {
				name: variableName
			}
		}
	});
};

Template.environmentVariables.events({
	'click .variable-value': function(event, template) {
		if (template.editingVariables.indexOf(this.name) === -1) {
			template.editingVariables.push(this.name);
			template.editingVariablesDep.changed();
		}
	},

	'click .do-save-variable': function(event, template) {
		var editingIdx = template.editingVariables.indexOf(this.name);
		template.editingVariables.splice(editingIdx, 1);
		template.editingVariablesDep.changed();

		var newVariableName = template.find('input[name="variable-name"]').value;
		var newVariableValue = template.find('input[name="variable-value"]').value;

		if (newVariableName) {
			var variableIdx = template.data.variables.indexOf(this);
			var updateOp = {
				$set: {}
			};
			var variablePath = 'variables.' + variableIdx;
			updateOp.$set[variablePath] = {
				name: newVariableName,
				value: newVariableValue
			};

			var result = Environments.update({
				_id: template.data._id
			}, updateOp);
		} else {
			deleteVariable(template.data._id, this.name);
		}
	},

	'click .do-delete-variable': function(event, template) {
		var idx = template.editingVariables.indexOf(this.name);
		template.editingVariables.splice(idx, 1);
		template.editingVariablesDep.changed();

		deleteVariable(template.data._id, this.name);
	},

	'click .do-add-variable': function(event, template) {
		Environments.update({
			_id: this._id,
		}, {
			$push: {
				variables: {
					name: '',
					value: ''
				}
			}
		});
		template.editingVariables.push('');
		template.editingVariablesDep.changed();
	}
});