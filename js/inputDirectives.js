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
}).


directive('contenteditable', function() {
       return {
           require: 'ngModel',
           link: function(scope, elm, attrs, ctrl) {
               // view -> model
               elm.bind('blur', function() {
                   console.log("blur: ", ctrl.$viewValue);
                   console.log("attrs = ", attrs);
                   console.log("scope = ", scope);
                   console.log("ctrl = ", ctrl);
                   scope.$apply(function() {
                       ctrl.$setViewValue(elm.html());
                   });
               });

               // model -> view
               ctrl.$render = function() {
                   console.log("render: ", ctrl.$viewValue);
                   console.log("attrs = ", attrs);
                   console.log("scope = ", scope);
                   console.log("ctrl = ", ctrl);
                   elm.html(ctrl.$viewValue);
               };

               // load init value from DOM
               ctrl.$setViewValue(scope.note.content);
               elm.html(ctrl.$viewValue);
           }
       };
   });

//.

/**
 * This directive watches an attribute called focusMe.  If it becomes true,
 * the widget that this directive is attached to will set its focus.
 */
//    directive('embiggen', function($timeout, $window) {
//                  return function (scope, element) {
//                      var w = angular.element($window);
//                      var elem = angular.element(element);
//
//                      scope.getWindowDimensions = function () {
//                          var res = { 'h': w[0].innerHeight, 'w': w[0].innerWidth };
//                          console.log("getWindowDimensions() result: ", res);
//                          return res;
//                      };
//
//                      scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
//                          scope.windowHeight = newValue.h;
//                          scope.windowWidth = newValue.w;
//                          elem.css("height", (newValue.h - 200) + "px");
//                          console.log("element: ", elem);
//
////                          console.log(element);
////                          console.log("height: ", newValue.h, ", width: ", newValue.w);
////                          scope.style = function () {
////                              return {
////                                  'height': (newValue.h - 100) + 'px'
////                              };
////                          };
//                      }, true);
//
//                      w.bind('resize', function () {
//                          scope.$apply();
//                      });
//                  }
//              });







