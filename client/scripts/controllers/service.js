angular.module('dockerSpawnerApp').controller('ServiceCtrl', function($scope, $state, service, $modal, ServiceDestination, $http) {
    $scope.service = service;

    $scope.service.variables = $scope.service.variables || [];

    $scope.updateDestinations = function() {
        if ($scope.service._id) {
            $scope.loadingDestinations = true;
            $scope.serviceDestinations = ServiceDestination.query({serviceId: $scope.service._id});
            $scope.serviceDestinations.$promise.then(function() {
                $scope.loadingDestinations = false;
            });
        }
    };

    $scope.updateDestinations();

    $scope.save = function() {
        $scope.service.$save().then(function(service) {
            $state.go("services");
        });
    };

    $scope.delete = function() {
        if ($scope.service._id) {
            if (window.confirm('Sure?')) {
                $scope.service.$delete().then(function(service) {
                    $state.go("services");
                });
            }
        } else {
            $state.go("services");
        }
    };

    $scope.addDestination = function() {
        openServiceDestinationPopup(new ServiceDestination({
            serviceId: $scope.service._id
        }));
    };

    $scope.editDestination = function(serviceDestination) {
        openServiceDestinationPopup(serviceDestination);
    };

    $scope.spawn = function(serviceDestination) {
        serviceDestination.isSpawning = true;
        $scope.service.$save().then(function() {
            $http.post('/api/service-destinations/' + serviceDestination._id + '/spawn')
                .then(function(data) {
                    console.log("Spawn success", data);
                    serviceDestination.isSpawning = false;
                })
                .catch(function(response) {
                    serviceDestination.isSpawning = false;
                    console.error("Spawning error", response.data);
                });
        });
    };

    function openServiceDestinationPopup(serviceDestination) {
        $modal.open({
            templateUrl: '/views/service-destination.html',
            controller: 'ServiceDestinationCtrl',
            resolve: {
                serviceDestination: function() {
                    return serviceDestination;
                },
                service: function() {
                    return $scope.service;
                }
            }
        }).result.then(function() {
            $scope.updateDestinations();
        });
    }
});
