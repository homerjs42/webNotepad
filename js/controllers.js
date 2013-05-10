'use strict';

/* Controllers */

angular.module('webNotepad.controllers', ['ngResource']).

/**
 * EditNote Controller
 * @param $scope
 * @param $routeParams
 * @param $location
 * @param $rootScope
 * @param sessionService
 * @constructor
 */
controller('EditNoteCtrl', function EditNoteCtrl($scope, $routeParams, $location, $rootScope, noteService, sessionService) {
    $scope.session = sessionService.getSession();
    $scope.note = null;
    $scope.saveNote = function saveNote() {
        $scope.note.date = new Date();
        noteService.saveNote($scope.note);
        $location.path("/");
    }

    $scope.getNote = function getNote(noteId) {
        noteService.getNote(noteId)
    }

    $scope.deleteNote = function deleteNote(note) {
        noteService.deleteNote(note);
        $location.path("/");
    }


    $scope.$on('sessionStateChanged', function() {
        $scope.session = sessionService.getSession();
        if ($scope.session) {
            $scope.note = noteService.getNote($routeParams.noteId);
        }
    });

    $scope.$on('sessionStateError', function() {        
        $scope.session = sessionService.getSession();
    });

    if ($scope.session) {
        $scope.note = noteService.getNote($routeParams.noteId);
    }
}).


/**
 * NoteList Controller
 * @param $scope
 * @param $dialog
 * @param $location
 * @param sessionService
 * @constructor
 */
controller('NoteListCtrl', function NoteListCtrl($scope, $location, $resource, noteService, sessionService) {
    $scope.session = sessionService.getSession();
    $scope.error = null;
    $scope.loading = false;
    $scope.noteList;

    $scope.$on('sessionStateChanged', function() {        
        $scope.session = sessionService.getSession();
        console.log("sessionStateChanged, session=", $scope.session);
        if ($scope.session) {
            $scope.getNotes();
        } else {
            $scope.noteList = [];
        };
    });


    $scope.$on('noteDeleted', function() {
        $scope.session = sessionService.getSession();
        if ($scope.session) {
           $scope.getNotes();
        } else {
           $scope.noteList = [];
        };
    });

    $scope.getNotes = function() {
        $scope.noteList = noteService.getNoteList();
    }

    $scope.deleteNote = function deleteNote(note) {
        noteService.deleteNote(note);
        $location.path("/");
    }

    if ($scope.session) {
        $scope.getNotes();
    }
});


function TestCtrl($scope, localStorageService) {
    $scope.myvalue = localStorageService.get('screenerApp.myValue');
    $scope.save = function save(value) {
        var o = {"someData": "this is a saved object", "value" : value};
        localStorageService.add('screenerApp.myValue', o);
        o = localStorageService.get('screenerApp.myValue');
        $scope.myvalue = o;
        console.log($scope.myvalue);
    }
    $scope.clear = function clear() {
        localStorageService.clearAll();
        $scope.myvalue = localStorageService.get('screenerApp.myValue');
    }
}


