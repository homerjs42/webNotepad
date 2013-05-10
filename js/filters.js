'use strict';

/* Filters */

angular.module('webNotepad.filters', []).

/**
 * This filter is kind of pointless, but it shows what can be done.
 * it takes the input and converts it to CamelCase using the following rule
 * if a character is whitespace or _, consume it and Uppercase the next 
 * non-whitespace/underscore character.
 */
filter('camelCase', function() {
    return function(text) {
        var result = "";
        var inWhitespace = false;
        for (var i = 0; i < text.length; i++) {
            var c = text.charAt(i);
            if (c == ' ' || c == '_') {
                inWhitespace = true; // we'll pretend that _ is whitespace
            } else {
                if (inWhitespace) {
                    result += new String(c).toUpperCase();
                } else {
                    result += c;
                }
                inWhitespace = false;
            }              
        }

        return result;
    };
});

