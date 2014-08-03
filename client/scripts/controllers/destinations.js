angular.module('dockerSpawnerApp').controller('DestinationsCtrl', function($scope, Destination, $state) {
    $scope.loadingData = false;

    $scope.updateList = function() {
        $scope.loadingData = true;
        $scope.destinations = Destination.query();
        $scope.destinations.$promise.then(function() {
            $scope.loadingData = false;
        });
    };
    $scope.updateList();


    $scope.addDestination = function() {
        $state.go("destination", {destinationId: 'new'});
    };
});
