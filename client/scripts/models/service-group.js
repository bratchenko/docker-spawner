angular.module('dockerSpawnerApp').factory('ServiceGroup', function($resource) {
    var ServiceGroup = $resource('/api/service-groups/:id', {
        id: '@_id'
    });

    return ServiceGroup;
});
