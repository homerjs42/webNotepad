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
function($window, $http, $cookies, $rootScope) {             // service constructor.  parameters are the dependencies that must be injected
    var session = null;
    var sessionError = null;
    var sessionService = {
    
    /**
     * Login method.
     * @param credentials - a scope object containing a credentials object and a session field
     * @returns nothing, but session in login state will be filled on success.
     */
    login: function(credentials) {
        // fake service for now.
        if (credentials.userName == 'doug' && credentials.password == 'doug') {
                session = {id: new Date().getTime(), name: credentials.userName };
                $cookies['defaultDomainSID'] = "" + session.id;
                $cookies['name'] = session.name;
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
    logout: function() {
        session = null;
        delete $cookies['defaultDomainSID'];
        delete $cookies['name'];
        $rootScope.$broadcast('sessionStateChanged');
    },

        
    /**
     * clear session method.  called on session error
     * @returns nothing, but session will be null on completion
     */
    clearSession: function() {
        session = null;
        delete $cookies['defaultDomainSID'];
        delete $cookies['name'];
        $rootScope.$broadcast('sessionStateChanged');
    },
      
    
    /**
     * 
     * @returns session
     */
    getSession: function() {
        if (session == null) {
            var sessionState = $cookies['defaultDomainSID'];
            var name = $cookies['name'];
            console.log($cookies);
            console.log("state: ", sessionState);
//            console.log(sessionState);
//            var sessionState = $cookies.ses;
            if (sessionState) {
                session = { id: sessionState, name: name };
                $rootScope.$broadcast('sessionStateChanged');
            }            
        }
        
        return session;
    },
    
    /**
     * 
     * @returns sessionError
     */
    getSessionError: function() {
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
        function($http, $resource, $window, $rootScope, localStorageService, sessionService) {
            var KEY = "put your key here";
            var BASE_PATH = 'https://api.mongolab.com/api/1/databases/simple_test_db/collections/'
            var noteList;
            var session = sessionService.getSession();


            var getNoteList = function() {
                var localNotes = localStorageService.get('localNotes');

                if (session) {
                    var url = BASE_PATH + session.name;
                    $http.get(url,
                              {                                                       // this is a configuration object.  at the moment we only use the params field
                                  params: { apiKey: KEY }
                              }).
                        success(function(data, status) {           // on success method
                                    console.log("success --> data: ", data, "; status: ", status);
                                }).
                        error(function(data, status) {
                                  console.log("error --> data: ", data, "; status: ", status, "; error count: ", errCount);
                              });

                }

                if (localNotes) {
                    noteList = localNotes;
                }
                return noteList;
            };


            var getNote = function(noteId) {
                getNoteList();
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
                    note = {
                        id: new Date().getTime(),
                        date: new Date(),
                        content: ''
                    };
                }
                return note;
            };


            var saveNote = function(note) {
                var found = false;
                getNoteList();
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

                if (session) {
                    var url = BASE_PATH + session.name + '?apiKey=' + KEY;
                    $http.post(url,
                              { note: angular.toJson(note) }
                    ).
                        success(function(data, status) {           // on success method
                                    console.log("success --> data: ", data, "; status: ", status);
                                }).
                        error(function(data, status) {
                                  console.log("error --> data: ", data, "; status: ", status, "; error count: ", errCount);
                              });

                }

                localStorageService.add('localNotes', noteList);
            };


            var deleteNote = function(note) {
                var nl = [];
                getNoteList();
                if (noteList) {
                    for (var i = 0; i < noteList.length; i++) {
                        if (noteList[i].id != note.id) {
                            nl.push(noteList[i]);
                        }
                    }
                    noteList = nl;
                    localStorageService.add('localNotes', nl);
                }

                $rootScope.$broadcast('noteDeleted', [ note ]);
                note = null;
            };

            $rootScope.$on('sessionStateChanged', function() {
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
 