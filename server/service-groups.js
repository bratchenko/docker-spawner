module.exports = {
    find: findServiceGroups,
    findById: findServiceGroupById,
    create: createServiceGroup,
    update: updateServiceGroup,
    delete: deleteServiceGroup
};

var
    mongoose = require('mongoose');

var EnvironmentVariableSchema = mongoose.Schema({
    name: String,
    value: String
});

var ServiceGroupSchema = mongoose.Schema({
    name: String,
    baseDomain: String,
    defaultTag: String,

    variables: [EnvironmentVariableSchema]
});

var ServiceGroup = mongoose.connection.model('ServiceGroup', ServiceGroupSchema);

function findServiceGroups(params) {
    return ServiceGroup.find(params).sort({updatedTime: -1}).exec();
}

function findServiceGroupById(id) {
    return ServiceGroup.findById(id).exec();
}

function createServiceGroup(data) {
    return new ServiceGroup(data).save();
}

function updateServiceGroup(serviceGroup, data) {
    return serviceGroup.set(data).save();
}

function deleteServiceGroup(serviceGroup) {
    return serviceGroup.remove();
}
