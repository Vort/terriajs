'use strict';

module.exports = function(config) {
    return {
        browserDisconnectTimeout: 10000, // default 2000
        browserDisconnectTolerance: 1, // default 0
        browserNoActivityTimeout: 4 * 60 * 1000, //default 10000
        captureTimeout: 4 * 60 * 1000, //default 60000

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: 'wwwroot',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            'build/TerriaJS-specs.js', {
                pattern: 'build/Cesium/**',
                watched: false,
                included: false,
                served: true
            }
        ],

        proxies: {
            '/data': 'http://localhost:3002/data',
            '/images': 'http://localhost:3002/images',
            '/test': 'http://localhost:3002/test',
            '/build': 'http://localhost:3002/build'
        },

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['spec'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultanous
        concurrency: 5,

        specReporter: {
            suppressErrorSummary: false,
            suppressFailed: false,
            suppressPassed: true,
            suppressSkipped: false
        }
    };
};
