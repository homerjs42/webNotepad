'use strict';

/* Input Directives */


angular.module('webNotepad.inputDirectives', []).

/**
 * This directive watches an attribute called focusMe.  If it becomes true,
 * the widget that this directive is attached to will set its focus.
 */
    directive('focusMe',function ($timeout) {
        return function (scope, element, attrs) {
            scope.$watch(attrs.focusMe, function (focusMe) {
                if (focusMe) {
                    $timeout(function () {
                        element[0].focus();
                    }, 1);
                }
            });
        };
    }).


    directive('contenteditable', function () {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                // view -> model
                elm.bind('blur', function () {
                    scope.$apply(function () {
                        ctrl.$setViewValue(elm.html());
                    });
                });

                // model -> view
                ctrl.$render = function () {
                    elm.html(ctrl.$viewValue);
                };

                // load init value from DOM
                ctrl.$setViewValue(scope.note.content);
                elm.html(ctrl.$viewValue);
            }
        };
    });






