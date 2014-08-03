angular.module('dockerSpawnerApp').factory('Destination', function($resource) {
    var Destination = $resource('/api/destinations/:id', {
        id: '@_id'
    });

    return Destination;
});
