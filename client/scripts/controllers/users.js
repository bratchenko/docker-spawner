angular.module('dockerSpawnerApp').controller('UsersCtrl', function($scope, User) {

    $scope.newUser = {};

    $scope.loadingData = false;

    $scope.updateUsersList = function() {
        $scope.loadingData = true;
        $scope.users = User.query();
        $scope.users.$promise.then(function() {
            $scope.loadingData = false;
        });
    };
    $scope.updateUsersList();


    $scope.toggleUserIsAdmin = function(user) {
        user.isAdmin = !user.isAdmin;
        user.$save();
    };

    $scope.changeUserPassword = function(user, password) {
        User.changePassword({
            id: user._id
        }, {
            password: password
        });
    };

    $scope.createNewUser = function() {
        if ($scope.newUser.login && $scope.newUser.password) {
            var user = new User({
                login: $scope.newUser.login,
                password: $scope.newUser.password,
            });
            user.$save();
            $scope.users.push(user);
        }
    };

    $scope.deleteUser = function(user) {
        if (confirm('Sure?')) {
            user.$delete();
            var idx = $scope.users.indexOf(user);
            if (idx !== -1) {
                $scope.users.splice(idx, 1);
            }
        }
    };
});
