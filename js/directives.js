'use strict';

/* Directives */


angular.module('webNotepad.directives', []).

/**
 * Directive defining a login widget.
 */
directive('systemHeader', function() {
    return {
        restrict: 'C',                                // only allowed as a class <div class="login-widget">/div>
        replace: true,                                // replace the element with the directive class
        transclude: false,
        templateUrl: 'htmlViews/SystemHeader.html',     // the template that will be doing the replacing
        controller: function HeaderCtrl($scope, sessionService) {  // javascript logic + scoping for this widget.
            $scope.loggedIn = sessionService.getSession() != null;

            // listen for global session events (broadcast by session service). 
            $scope.$on('sessionStateChanged', function() {
                var session = sessionService.getSession();
                $scope.loggedIn = session;
            });
            $scope.$on('sessionStateError', function(event, msg) {               
                $scope.loggedIn = false;
            });
        },
        // The linking function will add behavior to the template
        link: function(scope, element, attrs) {

        }
    };
}).


/**
 * Directive defining a login widget.
 */
directive('loginWidget', function() {
    return {
        restrict: 'C',                                // only allowed as a class <div class="login-widget">/div>
        replace: true,                                // replace the element with the directive class
        transclude: false,
        templateUrl: 'htmlViews/LoginWidget.html',     // the template that will be doing the replacing
        controller: function LoginCtrl($scope, $timeout, $location, sessionService) {  // javascript logic + scoping for this widget.
            $scope.credentials = {};
            $scope.focusUsername = true;
            $scope.focusPassword = false;
            $scope.error = false;
            $scope.errorMessage = null;
            $scope.session = sessionService.getSession();
            $scope.doLogin = function () {
                sessionService.login($scope.credentials);                
            };
            
            $scope.resetLogin = function(error) {
                $scope.credentials = {};
                if (error) {
                    $scope.session = null;                    
                }
                if ($scope.focusUsername) { // hack to work around annoying data binding issue
                    $scope.focusUsername = false;
                    $timeout(function(){$scope.focusUsername=true;},40);
                } else {
                    $scope.focusUsername = true;                    
                }
                $scope.focusPassword = false;
                $scope.error = error;
                if (!error) {
                    $scope.errorMessage = null;
                }
            };

            // listen for global session events (broadcast by session service). 
            $scope.$on('sessionStateChanged', function() {
                $scope.session = sessionService.getSession();
                if (!$scope.session && !$scope.error) {
                    $scope.resetLogin(false);
                } 
            });
            $scope.$on('sessionStateError', function(event, msg) {               
                if (msg) {
                    $scope.errorMessage = msg.message;
                }
                $scope.resetLogin(true);
                sessionService.clearSession();
            });
        },
        // The linking function will add behavior to the template
        link: function(scope, element, attrs) {

        }
    };
}).


/**
 * Directive defining the logout widget
 */
directive ('logoutWidget', function() {
    return {
        restrict: 'A',                          // only allowed as an attribute: <span logout-widget></span> 
        replace: true,                          // replaces the element with this directive text
        transclude: false,
        template: '<a class="btn pull-right" ng-show="session" ng-click="doLogout()" ><i class="icon-lock icon-white"></i> logout</a>',
        controller: function LogoutCtrl($scope, sessionService) {  // JavaScript logic to log out the user.
            $scope.session = sessionService.getSession();
            $scope.doLogout = function() {
                sessionService.logout();
            };
            // listen for global session events (broadcast by session service). 
            $scope.$on('sessionStateChanged', function() {
                $scope.session = sessionService.getSession();
            });
        },
        // The linking function will add behavior to the template
        link: function(scope, element, attrs) {

        }
    };    
}).


/**
 * toaster directive: pops up a short message for 4 seconds that then goes away
 * If the user clicks on the message, it will stay up until they close it.
 * be sure that you have included toaster.css first!
 * Also, this really ought to be a singleton!
 * <div toaster></div>
 */
directive('toaster', function() {
    return {
        restrict: 'A',                                        // only allowed as an attribute <div toaster></div>
        replace: true,                                        // replace the element with the directive class
        transclude: false,
        templateUrl: 'htmlViews/Toaster.html',                // the template that will be doing the replacing
        controller: function ToasterCtrl($scope, $timeout) {  // javascript logic + scoping for this widget.
            $scope.showMe = false;
            $scope.showCloseBtn = false;
            $scope.message = '';
            $scope.timerPromise = null;

            $scope.cancelTimeout = function() {
                if ($scope.showMe && $scope.timerPromise) {
                    $scope.showCloseBtn = true;
                    $timeout.cancel($scope.timerPromise);
                }
            };
            
            $scope.close = function() {
                $scope.showMe = false;
                $scope.timerPromise = null;
                $scope.message = '';
            };
            
            $scope.$on('showToastMessage', function(event, message) {
                $scope.showCloseBtn = false;
                if ($scope.timerPromise) {
                    $timeout.cancel($scope.timerPromise);
                    $scope.message += "\n" + message.message; 
                    $scope.showMe = true;
                } else {
                    $scope.message = message.message;                     
                }
                $scope.showMe = true;
                $scope.timerPromise = $timeout(function() {
                    $scope.close();
                }, 4000);
            });
        },
    };
});

