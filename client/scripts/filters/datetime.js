angular.module('dockerSpawnerApp')
    .filter('datetime', function () {
        return function (date) {
            return window.moment(date).format("YYYY-MM-DD hh:mm:ss");
        };
    });
