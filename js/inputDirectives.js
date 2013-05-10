'use strict';

/* Input Directives */


angular.module('webNotepad.inputDirectives', []).

/**
 * This directive watches an attribute called focusMe.  If it becomes true,
 * the widget that this directive is attached to will set its focus.
 */
directive('focusMe', function($timeout) {
    return function(scope, element, attrs) {        
        scope.$watch(attrs.focusMe, function(focusMe) {
            if (focusMe) {
                $timeout(function() {element[0].focus();}, 1);
            }
        });
    };
});

