angular.module('dockerSpawnerApp', [
    'ngResource',
    'ui.router',
    'ui.bootstrap',
    'btford.socket-io'
])

.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

    $stateProvider
        .state('services', {
            url: '/services',
            controller: 'ServicesCtrl',
            templateUrl: '/views/services.html'
        })
        .state('service', {
            url: '/services/:serviceId',
            controller: 'ServiceCtrl',
            templateUrl: '/views/service.html',
            resolve: {
                service: function(Service, $stateParams) {
                    if ($stateParams.serviceId === 'new') {
                        return new Service();
                    } else {
                        var service = Service.get({
                            id: $stateParams.serviceId
                        });
                        return service.$promise.then(function() {
                            return service;
                        });
                    }
                }
            }
        })
        .state('groups', {
            url: '/groups',
            controller: 'GroupsCtrl',
            templateUrl: '/views/groups.html'
        })
        .state('group', {
            url: '/groups/:groupId',
            controller: 'GroupCtrl',
            templateUrl: '/views/group.html'
        })
        .state('destinations', {
            url: '/destinations',
            controller: 'DestinationsCtrl',
            templateUrl: '/views/destinations.html'
        })
        .state('destination', {
            url: '/destinations/:destinationId',
            controller: 'DestinationCtrl',
            templateUrl: '/views/destination.html',
            resolve: {
                destination: function(Destination, $stateParams) {
                    if ($stateParams.destinationId === 'new') {
                        return new Destination();
                    } else {
                        var service = Destination.get({
                            id: $stateParams.destinationId
                        });
                        return service.$promise.then(function() {
                            return service;
                        });
                    }
                }
            }
        })
        .state('users', {
            url: "/users",
            controller: 'UsersCtrl',
            templateUrl: '/views/users.html'
        });

    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise("/services");
})

.run(function(CURRENT_USER, $rootScope) {
    $rootScope.currentUser = CURRENT_USER;
});
