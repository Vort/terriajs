'use strict';

var SharePopupViewModel = require('../../lib/ViewModels/SharePopupViewModel');
var Terria = require('../../lib/Models/Terria');
var queryToObject = require('terriajs-cesium/Source/Core/queryToObject');
var URI = require('urijs');
var WMSCatalogItem = require('../../lib/Models/WebMapServiceCatalogItem');
var CSVCatalogItem = require('../../lib/Models/CsvCatalogItem');
var CatalogGroup = require('../../lib/Models/CatalogGroup');
var createCatalogMemberFromType = require('../../lib/Models/createCatalogMemberFromType');

describe('SharePopupViewModel', function() {
    var terria;
    var sharePopup;

    beforeEach(function() {
        terria = new Terria({
            baseUrl: './'
        });
        terria.baseMap = {};
        createCatalogMemberFromType.register('group', CatalogGroup);
        createCatalogMemberFromType.register('item', WMSCatalogItem);
        createCatalogMemberFromType.register('csv', CSVCatalogItem);
    });

    describe('share url', function() {
        doTests(function() {
            return sharePopup.url;
        });
    });

    describe('embed url', function() {
        doTests(function() {
            // Get the src of the embed code
            return /src="(.*)"/.exec(sharePopup.embedCode)[1];
        });
    });

    function doTests(urlGetter) {
        testUserProperties(urlGetter);
        testSharedCatalogMembers(urlGetter);
    }

    /**
     * Runs tests to ensure that user properties are embedded into the url
     * generated by the SharePopupViewModal
     *
     * @param urlGetter a function that returns the url to test, after the sharePopup has been
     *      initialised.
     */
    function testUserProperties(urlGetter) {
        var ACTIVE_TAB_ID = 'Search';
        var ANY_STRING_VALUE = 'Any string value';

        it('includes whitelisted user properties', function() {
            terria.userProperties.activeTabId = ACTIVE_TAB_ID;
            terria.userProperties.couldBeAnyString = ANY_STRING_VALUE;

            init();

            var url = urlGetter();
            var parsed = parseUrl(url);

            expect(parsed.activeTabId).toBe(ACTIVE_TAB_ID);
            expect(parsed.couldBeAnyString).toBe(ANY_STRING_VALUE);
        });

        it('excludes non-whitelisted user properties', function() {
            terria.userProperties.notWhiteListed = ANY_STRING_VALUE;

            init();

            var url = urlGetter();
            var parsed = parseUrl(url);

            expect(parsed.notWhiteListed).toBeUndefined();
        });
    }

    function testSharedCatalogMembers(urlGetter) {
        describe('when sharing catalog members', function() {
            it('serializes enabled items', function(done) {
                getParsedShareLinkFor([{
                    name: 'C',
                    type: 'item',
                    isEnabled: true
                }]).then(function(parsed) {
                    expect(Object.keys(parsed).length).toBe(1);
                }).then(done).otherwise(done.fail);
            });

            it('serializes open groups', function(done) {
                getParsedShareLinkFor([{
                    name: 'C',
                    type: 'group',
                    isOpen: true
                }]).then(function(parsed) {
                    expect(Object.keys(parsed).length).toBe(1);
                }).then(done).otherwise(done.fail);
            });

            it('serializes an enabled item inside a closed group', function(done) {
                getParsedShareLinkFor([{
                    name: 'Group',
                    type: 'group',
                    isOpen: false,
                    items: [
                        {
                            name: 'Item',
                            type: 'item',
                            isEnabled: true
                        }
                    ]
                }]).then(function(parsed) {
                    expect(parsed['Root Group/Group/Item']).not.toBeUndefined();
                    expect(Object.keys(parsed).length).toBe(1);
                }).then(done).otherwise(done.fail);
            });

            it('serializes an open group and an enabled item in a flat map', function(done) {
                getParsedShareLinkFor([{
                    name: 'Group',
                    type: 'group',
                    isOpen: true,
                    items: [
                        {
                            name: 'Item',
                            type: 'item',
                            isEnabled: true
                        }
                    ]
                }]).then(function(parsed) {
                    expect(parsed['Root Group/Group/Item']).not.toBeUndefined();
                    expect(parsed['Root Group/Group']).not.toBeUndefined();
                    expect(Object.keys(parsed).length).toBe(2);
                }).then(done).otherwise(done.fail);
            });

            it('filters out items with localData', function(done) {
                getParsedShareLinkFor([{
                    name: 'C',
                    type: 'csv',
                    data: {
                        'blah': 'otherBlah'
                    },
                    isEnabled: true
                }]).then(function(parsed) {
                    expect(Object.keys(parsed).length).toBe(0);
                }).then(done).otherwise(done.fail);
            });

            it('indexes against id', function(done) {
                getParsedShareLinkFor([{
                    id: 'blahId',
                    name: 'C',
                    type: 'csv',
                    isEnabled: true
                }]).then(function(parsed) {
                    expect(Object.keys(parsed)).toEqual(['blahId']);
                }).then(done).otherwise(done.fail);
            });

            it('indexes against path when id isn\'t available', function(done) {
                getParsedShareLinkFor([{
                    name: 'C',
                    type: 'csv',
                    isEnabled: true
                }]).then(function(parsed) {
                    expect(Object.keys(parsed)).toEqual(['Root Group/C']);
                }).then(done).otherwise(done.fail);
            });

            it('filters out non-shareable properties', function(done) {
                getParsedShareLinkFor([{
                    name: 'C',
                    showWarnings: true,
                    type: 'csv',
                    opacity: 0.8,
                    isEnabled: true
                }]).then(function(parsed) {
                    var item = parsed['Root Group/C'];
                    expect(item.opacity).toBe(0.8);
                    expect(item.showWarnings).toBeUndefined();
                }).then(done).otherwise(done.fail);
            });

            it('filters out name from the object', function(done) {
                getParsedShareLinkFor([{
                    name: 'C',
                    showWarnings: true,
                    type: 'csv',
                    opacity: 0.8,
                    isEnabled: true
                }]).then(function(parsed) {
                    var item = parsed['Root Group/C'];
                    expect(item.name).toBeUndefined();
                }).then(done).otherwise(done.fail);
            });

            it('filters out id from the object', function(done) {
                getParsedShareLinkFor([{
                    id: 'blah',
                    name: 'C',
                    type: 'csv',
                    isEnabled: true
                }]).then(function(parsed) {
                    var item = parsed['blah'];
                    expect(item.id).toBeUndefined();
                }).then(done).otherwise(done.fail);
            });

            it('filters out non-enabled items', function(done) {
                getParsedShareLinkFor([{
                    name: 'C',
                    type: 'csv'
                }]).then(function(parsed) {
                    expect(Object.keys(parsed).length).toBe(0);
                }).then(done).otherwise(done.fail);
            });

            it('filters out open groups with a closed ancestor', function(done) {
                getParsedShareLinkFor([{
                    name: 'Group',
                    type: 'group',
                    isOpen: false,
                    items: [
                        {
                            name: 'Group',
                            type: 'group',
                            isOpen: true,
                            items: [
                                {
                                    name: 'Group',
                                    type: 'group',
                                    isOpen: true,
                                    items: []
                                }
                            ]
                        }
                    ]
                }]).then(function(parsed) {
                    expect(Object.keys(parsed).length).toBe(0);
                }).then(done).otherwise(done.fail);
            });

            function getParsedShareLinkFor(json) {
                return terria.catalog.updateFromJson(json).then(function() {
                    init();

                    var url = urlGetter();
                    var initSources = JSON.parse(parseUrl(url).start).initSources;

                    return initSources.length > 2 ? initSources[1].sharedCatalogMembers : {};
                });
            }
        });
    }

    function init() {
        sharePopup = new SharePopupViewModel({
            terria: terria,
            userPropWhiteList: SharePopupViewModel.defaultUserPropWhiteList.concat(['couldBeAnyString'])
        });
    }

    /**
     * Parses the data that the share popup encodes in the URL.
     */
    function parseUrl(url) {
        var uri = new URI(url);
        var hash = uri.fragment();
        return queryToObject(hash);
    }
});
