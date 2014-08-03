angular.module('dockerSpawnerApp').factory('User', function($resource) {
    var User = $resource(
        '/api/users/:id',
        {
            id: '@_id'
        }, {
            changePassword: {
                url: '/api/users/:id/change-password',
                method: 'POST'
            }
        }
    );

    return User;
});
