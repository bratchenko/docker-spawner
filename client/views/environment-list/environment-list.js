Template.environmentList.environments = function() {
    return Environments.find();
};

Template.environmentList.events({
    'click .do-add-environment': function(event, template) {
        var nameEl = template.find('input[name="name"]');
        var name = nameEl.value;
        if (name) {
            Environments.insert({name: name});
            nameEl.value = null;
        }
    }
});
