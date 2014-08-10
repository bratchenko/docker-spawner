module.exports = {
    find: findServiceDestinations,
    findById: findServiceDestinationById,
    findListById: findServiceDestinationListById,
    create: createServiceDestination,
    update: updateServiceDestination,
    delete: deleteServiceDestination,
    spawn: spawnServiceDestination
};

var
    mongoose = require('mongoose');

var EnvironmentVariableSchema = mongoose.Schema({
    name: String,
    value: String
});

var ServiceDestinationSchema = mongoose.Schema({
    serviceId: mongoose.Schema.Types.ObjectId,
    destinationId: mongoose.Schema.Types.ObjectId,
    serviceGroupId: mongoose.Schema.Types.ObjectId,

    variables: [EnvironmentVariableSchema],

    parameters: mongoose.Schema.Types.Mixed,

    lastSpawnId: mongoose.Schema.Types.ObjectId
});

var ServiceDestination = mongoose.connection.model('ServiceDestination', ServiceDestinationSchema);

function findServiceDestinations(params) {
    return ServiceDestination.find(params).sort({updatedTime: -1}).exec();
}

function findServiceDestinationById(id) {
    return ServiceDestination.findById(id).exec();
}

function findServiceDestinationListById(ids) {
    return ServiceDestination.find({
        _id: {
            $in: ids
        }
    }).exec();
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
    return require('./spawns').start(serviceDestination).
        then(function(spawn) {
            serviceDestination.lastSpawnId = spawn._id;
            return serviceDestination.save();
        });
}
