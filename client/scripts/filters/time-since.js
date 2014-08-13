angular.module('dockerSpawnerApp')
    .filter('timeSince', function () {
        return function (date) {
            return window.moment(date).fromNow();
        };
    });
