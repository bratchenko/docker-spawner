module.exports = function(app) {

    var serviceDestinations = require('../../server/service-destinations');

    app.get('/api/service-destinations', function(req, res) {
        res.json(serviceDestinations.find(req.query));
    });

    app.post('/api/service-destinations', function(req, res) {
        res.json(serviceDestinations.create(req.body));
    });

    app.get('/api/service-destinations/:serviceDestinationId', function(req, res) {
        res.json(
            serviceDestinations.findById(req.params.serviceDestinationId)
        );
    });

    app.post('/api/service-destinations/:serviceDestinationId', function(req, res) {
        res.json(
            serviceDestinations.findById(req.params.serviceDestinationId)
                .then(function(service) {
                    if (!service) throw new Error("Service destination not found");

                    return serviceDestinations.update(service, req.body);
                })
        );
    });

    app.post('/api/service-destinations/:serviceDestinationId/spawn', function(req, res) {
        res.json(
            serviceDestinations.findById(req.params.serviceDestinationId)
                .then(function(serviceDestination) {
                    if (!serviceDestination) throw new Error("Service destination not found");

                    return serviceDestinations.spawn(serviceDestination);
                })
        );
    });

    app.delete('/api/service-destinations/:serviceDestinationId', function(req, res) {
        res.json(
            serviceDestinations.findById(req.params.serviceDestinationId)
                .then(function(service) {
                    if (!service) throw new Error("Service not found");

                    return serviceDestinations.delete(service);
                })
        );
    });

};
