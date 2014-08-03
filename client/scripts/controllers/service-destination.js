angular.module('dockerSpawnerApp').controller('ServiceDestinationCtrl', function(serviceDestination, service, Destination, $scope, $modalInstance) {
    $scope.serviceDestination = serviceDestination;
    $scope.service = service;

    $scope.serviceDestination.variables = $scope.serviceDestination.variables || [];

    function findVariable(variables, name) {
        var found;
        variables.forEach(function(variable) {
            if (variable.name === name) {
                found = variable;
            }
        });
        return found;
    }

    service.variables.forEach(function(serviceVariable) {
        var destinationVariable = findVariable(serviceDestination.variables, serviceVariable.name);
        if (destinationVariable) {
            destinationVariable.defaultValue = serviceVariable.value;
        } else {
            serviceDestination.variables.push({
                name: serviceVariable.name,
                defaultValue: serviceVariable.value
            });
        }
    });

    $scope.destinations = Destination.query();

    $scope.save = function() {
        $scope.serviceDestination.$save().then(function() {
            $modalInstance.close();
        });
    };

    $scope.delete = function() {
        if (window.confirm('Sure?')) {
            $scope.serviceDestination.$delete().then(function() {
                $modalInstance.close();
            });
        }
    };
});
