'use strict';

/* Filters */

angular.module('webNotepad.filters', []).

/**
 * This filter is kind of pointless, but it shows what can be done.
 * it takes the input and converts it to CamelCase using the following rule
 * if a character is whitespace or _, consume it and Uppercase the next
 * non-whitespace/underscore character.
 */
    filter('camelCase', function () {
        return function (text) {
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
    }).


/**
 * Do not ever use this filter outside of ng-bind-html.
 * at least if you wnat to be safe, don't do it!
 * it turns escaped html into real html.
 */
    filter('htmlify', function() {
        return function (text) {
            var result = "";

            result = text.replace(/&lt;/ig, "<");
            result = result.replace(/&gt;/ig, ">");

            var httpMatcher = /(https?:\/\/[^\s<>]+)/gi;
            var result = result.replace(httpMatcher, "<a href=\"$1\">$1</a>");

            return result;
        }
    });

