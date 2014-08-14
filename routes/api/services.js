module.exports = function(app) {

    var services = require('../../server/services');

    app.get('/api/services', function(req, res) {
        res.json(services.find());
    });

    app.post('/api/services', function(req, res) {
        res.json(services.create(req.body));
    });

    app.get('/api/services/:serviceId', function(req, res) {
        res.json(
            services.findById(req.params.serviceId)
        );
    });

    app.post('/api/services/:serviceId', function(req, res) {
        res.json(
            services.findById(req.params.serviceId)
                .then(function(service) {
                    if (!service) throw new Error("Service not found");

                    return services.update(service, req.body);
                })
        );
    });

    app.delete('/api/services/:serviceId', function(req, res) {
        res.json(
            services.findById(req.params.serviceId)
                .then(function(service) {
                    if (!service) throw new Error("Service not found");

                    return services.delete(service);
                })
        );
    });

};
