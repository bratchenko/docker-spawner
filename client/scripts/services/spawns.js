angular.module('dockerSpawnerApp').service('Spawns', function(socket, $http, CONFIG) {

    this.cancel = function(spawn) {
        spawn.endTime = new Date();
        $http.post('/api/spawns/' + spawn._id + '/cancel')
            .catch(function(response) {
                window.alert(response.data.error);
            });
    };

    this.updateLastSpawnForServiceDestinations = function(serviceDestinations) {
        var idsToRequest = [];

        serviceDestinations.forEach(function(serviceDestination) {
            serviceDestination.lastSpawn = _getLastSpawnForServiceDestinationId(serviceDestination._id);

            if (!serviceDestination.lastSpawn._id) {
                serviceDestination.lastSpawn.loading = true;
                idsToRequest.push(serviceDestination._id);
            }
        });
        $http.get('/api/spawns/latest-for-service-destinations', {
            params: {
                'ids[]': idsToRequest
            }
        }).then(function(response) {
            response.data.forEach(function(spawn) {
                _processSpawn(spawn);
            });

            serviceDestinations.forEach(function(serviceDestination) {
                serviceDestination.lastSpawn = _getLastSpawnForServiceDestinationId(serviceDestination._id);
            });
        });

    };

    function _replaceObjectFields(object, newData) {
        var key;
        for (key in object) {
            delete object[key];
        }
        for (key in newData) {
            object[key] = newData[key];
        }
    }

    var lastSpawnForServiceDestinationId = {};
    function _getLastSpawnForServiceDestinationId(serviceDestinationId) {
        if (!lastSpawnForServiceDestinationId[serviceDestinationId]) {
            lastSpawnForServiceDestinationId[serviceDestinationId] = {};
        }
        return lastSpawnForServiceDestinationId[serviceDestinationId];
    }

    function _processSpawn(spawn) {
        _replaceObjectFields(_getLastSpawnForServiceDestinationId(spawn.serviceDestinationId), spawn);
    }

    socket.on('connect', function() {
        socket.emit('get-spawns', CONFIG.pageGenerationTime);
    });

    socket.on('spawn', function(spawn) {
        _processSpawn(spawn);
    });
});
