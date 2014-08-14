module.exports = function(app) {

    var Q = require('q');
    var serviceDestinations = require('../server/service-destinations');

    app.post('/hooks/image-updated', function(req, res, next) {
        var imageName = req.body.image;
        var imageTag = req.body.tag;

        serviceDestinations.findByImageAndTag(imageName, imageTag)
            .then(function(results) {
                var spawnPromises = [];

                results.forEach(function(serviceDestination) {
                    console.log(
                        "Respawning %s (%s) because %s:%s is updated",
                        serviceDestination._id,
                        serviceDestination.parameters ? serviceDestination.parameters.domain : "<no domain>",
                        imageName,
                        imageTag
                    );
                    spawnPromises.push(serviceDestinations.spawn(serviceDestination));
                });

                return Q.all(spawnPromises).then(function() {
                    res.status(204).end();
                });
            })
            .catch(function(err) {
                return next(err);
            });

    });

};
