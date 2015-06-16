(function() {

'use strict';

angular.module('superdesk.authoring.widgets', [])
    .provider('authoringWidgets', AuthoringWidgetsProvider)
    .directive('sdAuthoringWidgets', AuthoringWidgetsDir)
    .directive('sdViewWidgets', ViewWidgetsDirective)
    .directive('sdWidgetsSidebar', WidgetsSidebarDirective)
    ;

WidgetsSidebarDirective.$inject = ['asset', '$routeParams', 'authoringWidgets'];
function WidgetsSidebarDirective(asset, $routeParams, authoringWidgets) {
    return {
        templateUrl: asset.templateUrl('superdesk-authoring/widgets/views/widgets-sidebar.html'),
        scope: {
            item: '=',
            side: '=',
            active: '=',
            display: '='
        },
        link: function($scope) {

            console.assert($scope.active, 'not active');

            $scope.activate = function(widget) {
                if (!widget.needUnlock || !$scope.item._locked) {
                    $scope.active[$scope.side] = $scope.active[$scope.side] === widget ? null : widget;
                }
            };

            $scope.closeWidget = function(widget) {
                $scope.active[$scope.side] = null;
            };

            var display = {};
            display[$scope.display] = true;
            $scope.widgets = _.filter(authoringWidgets, {side: $scope.side, display: display});

            // activate widget based on query string
            angular.forEach($scope.widgets, function(widget) {
                if ($routeParams[widget._id]) {
                    $scope.activate(widget);
                }
            });

            $scope.$watch('item._locked', function() {
                if ($scope.item && $scope.active[$scope.side]) {
                    var widget = $scope.active[$scope.side];
                    $scope.closeWidget(widget);
                    $scope.activate(widget);
                }
            });
        }
    };
}

ViewWidgetsDirective.$inject = ['asset'];
function ViewWidgetsDirective(asset) {
    return {
        controller: WidgetsManagerCtrl,
        templateUrl: asset.templateUrl('superdesk-authoring/widgets/views/view-widgets.html'),
        transclude: true
    };
}

function AuthoringWidgetsProvider() {

    var widgets = [];

    this.widget = function(id, config) {
        widgets.push(angular.extend({ // make a new instance for every widget
        }, config, {_id: id}));
    };

    this.$get = function() {
        return widgets;
    };
}

WidgetsManagerCtrl.$inject = ['$scope'];
function WidgetsManagerCtrl($scope) {
    $scope.activeWidgets = {
        left: null,
        right: null
    };
}

function AuthoringWidgetsDir() {
    return {
        controller: WidgetsManagerCtrl,
        templateUrl: 'scripts/superdesk-authoring/widgets/views/authoring-widgets.html',
        transclude: true
    };
}

})();
