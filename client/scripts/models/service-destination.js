angular.module('dockerSpawnerApp').factory('ServiceDestination', function($resource) {
    var ServiceDestination = $resource('/api/service-destinations/:id', {
        id: '@_id'
    });

    return ServiceDestination;
});
