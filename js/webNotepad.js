'use strict';


/**
 * This is our application.  It depends upon the filters, services,
 * controllers, directives, and Angular cookies modules.
 *
 */
var webNotepad = angular.module('webNotepad',
        ['webNotepad.filters',
         'webNotepad.services',
         'webNotepad.controllers',
         'webNotepad.directives',
         'webNotepad.inputDirectives',
         'ngCookies',
         'LocalStorageModule'
         ]);


/**
 * Here we are configuring routing for our <ngView> element.  This allows
 * us to use the history controls nicely.
 */
webNotepad.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider.when('/', {templateUrl: 'htmlViews/NoteList.html', controller: 'NoteListCtrl' });
    $routeProvider.when('/editNote/:noteId', {templateUrl: 'htmlViews/EditNote.html', controller: 'EditNoteCtrl'});
    $routeProvider.otherwise({redirectTo: '/'});
}]);
