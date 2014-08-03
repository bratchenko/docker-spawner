module.exports = {
    find: findDestinations,
    findById: findDestinationById,
    create: createDestination,
    update: updateDestination,
    delete: deleteDestination
};

var
    mongoose = require('mongoose');

var DestinationSchema = mongoose.Schema({

    name: String,
    type: String,

    parameters: mongoose.Schema.Types.Mixed

});

var Destination = mongoose.connection.model('Destination', DestinationSchema);

function findDestinations() {
    return Destination.find({}).sort({updatedTime: -1}).exec();
}

function findDestinationById(id) {
    return Destination.findById(id).exec();
}

function createDestination(data) {
    return new Destination(data).save();
}

function updateDestination(destination, data) {
    return destination.set(data).save();
}

function deleteDestination(destination) {
    return destination.remove();
}
