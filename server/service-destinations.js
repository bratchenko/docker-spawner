module.exports = {
    find: findServiceDestinations,
    findById: findServiceDestinationById,
    findListById: findServiceDestinationListById,
    findByImageAndTag: findServiceDestinationsByImageAndTag,
    create: createServiceDestination,
    update: updateServiceDestination,
    delete: deleteServiceDestination,
    spawn: spawnServiceDestination
};

var
    Q = require('q'),
    mongoose = require('mongoose');

var EnvironmentVariableSchema = mongoose.Schema({
    name: String,
    value: String
});

var ServiceDestinationSchema = mongoose.Schema({
    serviceId: mongoose.Schema.Types.ObjectId,
    destinationId: mongoose.Schema.Types.ObjectId,
    serviceGroupId: mongoose.Schema.Types.ObjectId,

    imageName: String,
    imageTag: String,

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

function findServiceDestinationsByImageAndTag(imageName, imageTag) {
    var services = require('./services');

    // We'll need that later to not filter all the results for uniquiness
    var checkedServiceIds = [];

    // Find services with the right image name and right tag name
    // And then find service destinations that have one of found serviceIds and no imageName or imageTag set or correct ones set
    var servicesWithCorrectImageNameAndTag = services.find({
        imageName: imageName,
        imageTag: imageTag
    });
    var serviceDestinations1 = servicesWithCorrectImageNameAndTag.then(function(results) {
        var serviceIds = results.map(function(result) {
            return result._id;
        });

        // Save serviceIds we checked to exclude them later
        checkedServiceIds = checkedServiceIds.concat(serviceIds);

        console.log("Correct image");
        return findServiceDestinations({
            serviceId: {
                $in: serviceIds
            },
            imageName: {
                $in: [null, imageName]
            },
            imageTag: {
                $in: [null, imageTag]
            }
        });
    });

    // Find services with the right image name and other tag name
    // Then find service destinations that have one of found serviceIds and correct imageTag set
    var servicesWithCorrectImageNameAndIncorrectTag = services.find({
        imageName: imageName,
        imageTag: {
            $ne: imageTag
        }
    });
    var serviceDestinations2 = servicesWithCorrectImageNameAndIncorrectTag.then(function(results) {
        var serviceIds = results.map(function(result) {
            return result._id;
        });

        // Save serviceIds we checked to exclude them later
        checkedServiceIds = checkedServiceIds.concat(serviceIds);

        return findServiceDestinations({
            serviceId: {
                $in: serviceIds
            },
            imageName: {
                $in: [null, imageName]
            },
            imageTag: imageTag
        });
    });

    // Find service destinations that have correct imageName and imageTag set
    var serviceDestinations3 = findServiceDestinations({
        serviceId: {
            $nin: checkedServiceIds,
        },
        imageName: imageName,
        imageTag: imageTag
    });

    return Q.all([serviceDestinations1, serviceDestinations2, serviceDestinations3])
        .then(function(resultLists) {
            var allServiceDestinations = [];
            resultLists.forEach(function(resultList) {
                allServiceDestinations = allServiceDestinations.concat(resultList);
            });
            return allServiceDestinations;
        });
}

function spawnServiceDestination(serviceDestination) {
    return require('./spawns').start(serviceDestination).
        then(function(spawn) {
            serviceDestination.lastSpawnId = spawn._id;
            return serviceDestination.save();
        });
}
