angular.module('dockerSpawnerApp').factory('Service', function($resource) {
    var Service = $resource('/api/services/:id', {
        id: '@_id'
    });

    return Service;
});
