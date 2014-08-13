angular.module('dockerSpawnerApp').directive('spawnStatus', function() {
    return {
        restrict: 'E',
        scope: {
            ngModel: '='
        },
        template: '<span ng-show="ngModel" title="{{ngModel.startTime | datetime}}" class="label label-default" ' +
                    'ng-class="{' +
                        '\'label-success\': ngModel.success, ' +
                        '\'label-danger\': ngModel.success === false' +
                        '}"' +
                  '>{{ngModel.startTime | timeSince}}</span>',
        replace: true
    };
});
