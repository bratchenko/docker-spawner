angular.module('dockerSpawnerApp').controller('ServicesCtrl', function($scope, Service, $state) {

    $scope.loadingData = false;

    $scope.updateList = function() {
        $scope.loadingData = true;
        $scope.services = Service.query();
        $scope.services.$promise.then(function() {
            $scope.loadingData = false;
        });
    };
    $scope.updateList();


    $scope.addService = function() {
        $state.go("service", {serviceId: 'new'});
    };
});
