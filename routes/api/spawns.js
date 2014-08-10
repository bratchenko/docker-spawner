module.exports = function(app) {

    var serviceDestinations = require('../../server/service-destinations');
    var spawns = require('../../server/spawns');

    app.get('/api/spawns/latest-for-service-destinations', function(req, res) {
        var serviceDestinationIds = req.param('ids') || [];
        res.json(
            serviceDestinations.findListById(serviceDestinationIds)
                .then(function(results) {
                    var spawnIds = [];
                    results.forEach(function(serviceDestination) {
                        if (serviceDestination.lastSpawnId) {
                            spawnIds.push(serviceDestination.lastSpawnId);
                        }
                    });
                    return spawns.findListById(spawnIds);
                })
        );
    });

    app.post('/api/spawns/:spawnId/cancel', function(req, res) {
        res.json(spawns.cancel(req.params.spawnId));
    });

};
