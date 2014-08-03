module.exports = {
    find: findServiceDestinations,
    findById: findServiceDestinationById,
    create: createServiceDestination,
    update: updateServiceDestination,
    delete: deleteServiceDestination,
    spawn: spawnServiceDestination
};

var
    mongoose = require('mongoose'),
    Q = require('q');

var EnvironmentVariableSchema = mongoose.Schema({
    name: String,
    value: String
});

var ServiceDestinationSchema = mongoose.Schema({
    serviceId: mongoose.Schema.Types.ObjectId,
    destinationId: mongoose.Schema.Types.ObjectId,
    serviceGroupId: mongoose.Schema.Types.ObjectId,

    variables: [EnvironmentVariableSchema],

    parameters: mongoose.Schema.Types.Mixed
});

var ServiceDestination = mongoose.connection.model('ServiceDestination', ServiceDestinationSchema);

function findServiceDestinations(params) {
    return ServiceDestination.find(params).sort({updatedTime: -1}).exec();
}

function findServiceDestinationById(id) {
    return ServiceDestination.findById(id).exec();
}

function createServiceDestination(data) {
    return new ServiceDestination(data).save();
}

function updateServiceDestination(serviceDestination, data) {
    return serviceDestination.set(data).save();
}

function deleteServiceDestination(serviceDestination) {
    return serviceDestination.remove();
}

function spawnServiceDestination(serviceDestination) {
    return require('./spawn-queue').add(serviceDestination);
}
