angular.module('dockerSpawnerApp')
    .filter('timeSince', function () {
        return function (date) {
            if (date) {
                return window.moment(date).fromNow();
            } else {
                return 'never';
            }
        };
    });
