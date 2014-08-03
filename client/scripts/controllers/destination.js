angular.module('dockerSpawnerApp').controller('DestinationCtrl', function($scope, $state, destination) {
    $scope.destination = destination;

    $scope.destination.type = 'shipyard'; // TODO: one day this will be selectable
    $scope.destination.parameters = $scope.destination.parameters || {};

    $scope.save = function() {
        $scope.destination.$save().then(function(destination) {
            $state.go("destinations");
        });
    };

    $scope.delete = function() {
        if (confirm('Sure?')) {
            $scope.destination.$delete().then(function(destination) {
                $state.go("destinations");
            });
        }
    };
});
