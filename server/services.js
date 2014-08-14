module.exports = {
    find: findServices,
    findById: findServiceById,
    create: createService,
    update: updateService,
    delete: deleteService
};

var
    mongoose = require('mongoose');

var EnvironmentVariableSchema = mongoose.Schema({
    name: String,
    value: String
});

var ServiceSchema = mongoose.Schema({
    environmentId: mongoose.Schema.Types.ObjectId,

    name: String,
    imageName: String,
    imageTag: String,
    host: String,

    variables: [EnvironmentVariableSchema],

    updatedTime: Date
});

ServiceSchema.pre('save', function(next) {
    this.updatedTime = new Date();
    next();
});

var Service = mongoose.connection.model('Service', ServiceSchema);

function findServices(params) {
    return Service.find(params).sort({updatedTime: -1}).exec();
}

function findServiceById(id) {
    return Service.findById(id).exec();
}

function createService(data) {
    return new Service(data).save();
}

function updateService(service, data) {
    return service.set(data).save();
}

function deleteService(service) {
    return service.remove();
}
