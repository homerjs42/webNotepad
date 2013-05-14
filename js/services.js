'use strict';

/* Services */
/**
 * It might be a good idea for this to be split up into several separate service
 * modules.  This is easy enough to do and would probably help with system
 * organization.
 */


angular.module('webNotepad.services', ['ngResource']).

// Value Service -- just returns a simple constant string
    value('version', '0.1').

/**
 * This is the Login service.  Use it to login and logout.
 * it stores the session into a cookie, also looks for that
 * cookie on login.
 */
    factory('sessionService',                        // service name
    function ($window, $http, $cookies, $rootScope) {             // service constructor.  parameters are the dependencies that must be injected
        var session = null;
        var sessionError = null;
        var sessionService = {

            /**
             * Login method.
             * @param credentials - a scope object containing a credentials object and a session field
             * @returns nothing, but session in login state will be filled on success.
             */
            login: function (credentials) {
                // fake service for now.
                if (credentials.userName && credentials.password) {
                    session = {id: new Date().getTime(), name: credentials.userName, pass: credentials.password };
                    $cookies['defaultDomainSID'] = "" + session.id;
                    $cookies['name'] = session.name;
                    $cookies['pass'] = session.pass;
                    $rootScope.$broadcast('sessionStateChanged');
                } else {
                    $rootScope.$broadcast('sessionStateError');
                    sessionError = {message: 'invalid credentials'};
                }
            },


            /**
             * logout method
             * @returns nothing, but session will be null on completion
             */
            logout: function () {
                session = null;
                delete $cookies['defaultDomainSID'];
                delete $cookies['name'];
                delete $cookies['pass'];
                $rootScope.$broadcast('sessionStateChanged');
            },


            /**
             * clear session method.  called on session error
             * @returns nothing, but session will be null on completion
             */
            clearSession: function () {
                session = null;
                delete $cookies['defaultDomainSID'];
                delete $cookies['name'];
                delete $cookies['pass'];
                $rootScope.$broadcast('sessionStateChanged');
            },


            /**
             *
             * @returns session
             */
            getSession: function () {
                if (session == null) {
                    var sessionState = $cookies['defaultDomainSID'];
                    var name = $cookies['name'];
                    var pass = $cookies['pass'];
                    console.log($cookies);
                    console.log("state: ", sessionState);

                    if (sessionState) {
                        session = { id: sessionState, name: name, pass: pass };
                        $rootScope.$broadcast('sessionStateChanged');
                    }
                }

                return session;
            },

            /**
             *
             * @returns sessionError
             */
            getSessionError: function () {
                return sessionError;
            }

        };

        sessionService.getSession();

        return sessionService;
    }                                                   // end of service constructor
).                                                  // end of service factory definition.


/**
 * Note service
 */
    factory('noteService',
    function ($http, $resource, $window, $rootScope, localStorageService, sessionService, api_key, api_base_path) {
        var KEY = api_key;
        var BASE_PATH = api_base_path;
        var noteList;
        var session = sessionService.getSession();


        var getNoteList = function (getRemotes) {
            console.log("getNoteList()  getRemotes = ", getRemotes);
            var localNotes = localStorageService.get('localNotes');

            if (!localNotes) {
                localNotes = [];
            }

            noteList = localNotes;
            console.log("local notes:", noteList);

            if (session && getRemotes) {
                var url = BASE_PATH + session.name;
                $http.get(url,
                    {                                                       // this is a configuration object.  at the moment we only use the params field
                        params: { apiKey: KEY }
                    }).
                    success(function (data, status) {           // on success method
                        for (var i = 0; i < data.length; i++) {
                            var note = angular.fromJson(data[i].note);
                            note.remoteId = data[i]._id.$oid;
                            var found = false;
                            for (var j = 0; j < localNotes.length; j++) {
                                if (localNotes[j].id == note.id) {
                                    found = true;
                                    var localDate = new Date(localNotes[j].date);
                                    var remoteDate = new Date(note.date);
                                    if (localDate.getTime() <= remoteDate.getTime()) { // local note is older than remote one, update it.
                                        localNotes[i] = note;
                                        console.log("updating note: ", note);
                                    }
                                    break;
                                }
                            }
                            if (!found) {
                                console.log("note not found in local store.  Adding it: ", note)
                                localNotes.push(note);
                            }
                        }
                        noteList = localNotes;
                        // save local note list with remotes too
                        localStorageService.add('localNotes', noteList);

                        // broadcast update
                        $rootScope.$broadcast('remoteNotesUpdated', noteList);
                    }).
                    error(function (data, status) {
                        console.log("error --> data: ", data, "; status: ", status, "; error count: ",
                            errCount);
                    });
            }

            return noteList;
        };


        var getNote = function (noteId) {
            getNoteList(false);
            var note = null;
            if (noteList) {
                for (var i = 0; i < noteList.length; i++) {
                    if (noteList[i].id == noteId) {
                        note = noteList[i];
                        break;
                    }
                }
            }

            if (note == null) {
                var newId = new Date().getTime();
                note = {
                    id: newId,
                    date: new Date(),
                    content: 'New Note...'
                };
                console.log("created new note: ", note);
            }
            return note;
        };

        function saveNoteLocally(note) {
            var found = false;
            if (noteList) {
                for (var i = 0; i < noteList.length; i++) {
                    if (noteList[i].id == note.id) {
                        noteList[i] = note;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    noteList.push(note);
                }
            } else {
                noteList = [ note ];
            }
            localStorageService.add('localNotes', noteList);
            console.log("stored local notes list: ", noteList);
        }

        var saveNote = function (note) {
            saveNoteLocally(note);

            if (session) {
                var url = BASE_PATH + session.name;
                if (note.remoteId) {
                    url += '/' + note.remoteId;
                    $http.put(url,
                        { note: angular.toJson(note) },
                        {
                            params: { apiKey: KEY }
                        }
                    ).
                        success(function (data, status) {           // on success method
                            $rootScope.$broadcast('showToastMessage', {message: "Note saved"});
                            console.log("saved note: ", note);
                        }).
                        error(function (data, status) {
                            console.log("error saving --> data: ", data, "; status: ", status);
                        });

                } else {
                    $http.post(url,
                        { note: angular.toJson(note) },
                        {
                            params: { apiKey: KEY }
                        }
                    ).
                        success(function (data, status) {           // on success method
                            note.remoteId = data._id.$oid;

                            // update with remote id
                            saveNoteLocally(note);
                            $rootScope.$broadcast('showToastMessage', {message: "Note saved"});
                            console.log("saved note: ", note);
                        }).
                        error(function (data, status) {
                            console.log("error saving --> data: ", data, "; status: ", status);
                        });

                }
            }
        };


        var deleteNote = function (note) {
            console.log("deleting note: ", note);
            var nl = [];
            getNoteList(false);
            if (noteList) {
                for (var i = 0; i < noteList.length; i++) {
                    var oldNote = noteList[i];
                    console.log("oldNote: ", oldNote, ", new note: ", note);
                    if (oldNote.id != note.id) {
                        nl.push(noteList[i]);
                    }
                }
                noteList = nl;
                localStorageService.add('localNotes', nl);
            }

            if (session && note.remoteId) {
                var url = BASE_PATH + session.name + '/' + note.remoteId;
                $http.delete(url,
                    {
                        params: {
                            apiKey: KEY
                        }
                    }
                ).
                    success(function (data, status) {           // on success method
                        // broadcast update
                        $rootScope.$broadcast('noteDeleted', true);
                        $rootScope.$broadcast('showToastMessage', {message: "Note removed from server."});
                        console.log("success deleting note: ", note, " --> data: ", data, "; status: ",
                            status);
                    }).
                    error(function (data, status) {
                        $rootScope.$broadcast('noteDeleted', true);
                        console.log("error deleting --> data: ", data, "; status: ", status);
                    });
            } else {
                $rootScope.$broadcast('noteDeleted', false);
            }
        };

        $rootScope.$on('sessionStateChanged', function () {
            session = sessionService.getSession();
        });


        return {
            getNoteList: getNoteList,
            saveNote: saveNote,
            deleteNote: deleteNote,
            getNote: getNote
        };
    }
);


/*
 * To add more services, remove the ; above and replace it with a ., followed by
 * the new service definition: 
 * factory('service_name', function(deps...) {
 *    return {
 *       serviceMethod: function(args...) { stuff },
 *       ...
 *    };
 * }); 
 * 
 */
 