module.exports = function(app) {

    var destinations = require('../../server/destinations');

    app.get('/api/destinations', function(req, res) {
        res.json(destinations.find());
    });

    app.post('/api/destinations', function(req, res) {
        res.json(destinations.create(req.body));
    });

    app.get('/api/destinations/:destinationId', function(req, res) {
        res.json(
            destinations.findById(req.params.destinationId)
        );
    });

    app.post('/api/destinations/:destinationId', function(req, res) {
        res.json(
            destinations.findById(req.params.destinationId)
                .then(function(service) {
                    if (!service) throw new Error("Service not found");

                    return destinations.update(service, req.body);
                })
        );
    });

    app.delete('/api/destinations/:destinationId', function(req, res) {
        res.json(
            destinations.findById(req.params.destinationId)
                .then(function(service) {
                    if (!service) throw new Error("Service not found");

                    return destinations.delete(service);
                })
        );
    });

};
