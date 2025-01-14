'use strict';

/*global require*/
var createKarmaBaseConfig = require('./test/Utility/createKarmaBaseConfig');

module.exports = function(config) {
    var options = Object.assign({}, createKarmaBaseConfig(config), {
        customLaunchers: {
            sl_chrome: {
                base: 'SauceLabs',
                browserName: 'chrome',
                platform: 'Windows 7'
            },
            sl_safari: {
                base: 'SauceLabs',
                browserName: 'safari',
                platform: 'OS X 10.11'
            },
            sl_ie9: {
                base: 'SauceLabs',
                browserName: 'internet explorer',
                platform: 'Windows 7',
                version: '9.0'
            },
            sl_ie10: {
                base: 'SauceLabs',
                browserName: 'internet explorer',
                platform: 'Windows 7',
                version: '10.0'
            },
            sl_ie11: {
                base: 'SauceLabs',
                browserName: 'internet explorer',
                platform: 'Windows 7',
                version: '11.0'
            },
            sl_firefox: {
                base: 'SauceLabs',
                browserName: 'firefox',
                platform: 'Windows 7'
            },
            sl_firefox_esr: {
                base: 'SauceLabs',
                browserName: 'firefox',
                platform: 'Windows 7',
                version: '38.0'
            }
        },

        // start these browsers
        browsers: ['sl_chrome', 'sl_safari', 'sl_firefox', 'sl_firefox_esr', 'sl_ie9', 'sl_ie10', 'sl_ie11'],

        sauceLabels: {
            testName: 'TerriaJS Unit Tests',
            tunnelIdentifier: process.env.TRAVIS_BUILD_NUMBER
        }
    });

    options.reporters.push('saucelabs');

    config.set(options);
};
