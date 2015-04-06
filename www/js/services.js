'use strict';

angular.module('Notepads.services', [])

.service('User', [
    function () {
        return {
            get: function() {
                return JSON.parse(window.localStorage.getItem('user')) || {};
            },
            set: function(user) {
                return window.localStorage.setItem('user', JSON.stringify(user));
            },
            create: function (fbId, name, photo, accessToken) {
                var user = {
                    facebookId: fbId,
                    name: name,
                    photo: photo,
                    accessToken: accessToken
                };
                return this.set(user);
            }
        };
    }
])

.service('Api', [
    '$http', 'User', 'APIUrl',
    function ($http, User, APIUrl) {
        var apiBase = APIUrl + '/api/v1';
        return {
            users: {
                auth: function(fbId, fbAccessToken) {
                    return $http({
                        url: apiBase + '/users/auth',
                        data: {
                            fbId: fbId,
                            fbAccessToken: fbAccessToken
                        },
                        method: 'POST',
                        cache: false
                    });
                },
                create: function(fbId, name, accToken) {
                    var user = {
                        facebookId: fbId,
                        name: name,
                        accessToken: accToken
                    };
                    //this.set() ?
                    User.set(user);
                }
            },
            notepads: {
                list: function() {
                    return $http({
                        url: apiBase + '/notepads?insidecats=1' + '&token=' + User.get().accessToken,
                        method: 'GET',
                        cache: false
                    });
                },
                getById: function (id) {
                    return $http({
                        url: apiBase + '/notepads/' + id + '?token=' + User.get().accessToken,
                        method: 'GET',
                        cache: false
                    });
                },
                add: function(notepad) {
                    return $http({
                        url: apiBase + '/notepads' + '?token=' + User.get().accessToken,
                        data: notepad,
                        method: 'POST',
                        cache: false
                    });
                },
                update: function(notepad) {
                    return $http({
                        url: apiBase + '/notepads/' + notepad._id + '?token=' + User.get().accessToken,
                        data: notepad,
                        method: 'PUT',
                        cache: false
                    });
                },
                remove: function(id) {
                    return $http({
                        url: apiBase + '/notepads/' + id + '?token=' + User.get().accessToken,
                        method: 'DELETE',
                        cache: false
                    });
                }
            },
            categories: {
                list: function() {
                    //console.log('categories list() called');
                    return $http({
                        url: apiBase + '/categories' + '?token=' + User.get().accessToken,
                        method: 'GET',
                        cache: false
                    });
                },
                getById: function (id) {
                    return $http({
                        url: apiBase + '/categories/' + id + '?token=' + User.get().accessToken,
                        method: 'GET',
                        cache: false
                    });
                },
                add: function(category) {
                    return $http({
                        url: apiBase + '/categories' + '?token=' + User.get().accessToken,
                        data: category,
                        method: 'POST',
                        cache: false
                    });
                },
                update: function(category) {
                    return $http({
                        url: apiBase + '/categories/' + category._id + '?token=' + User.get().accessToken,
                        data: category,
                        method: 'PUT',
                        cache: false
                    });
                },
                remove: function(id) {
                    return $http({
                        url: apiBase + '/categories/' + id + '?token=' + User.get().accessToken,
                        method: 'DELETE',
                        cache: false
                    });
                }
            }
        };
    }
])

.service('goToDashboard', [
    '$ionicHistory', '$state',
    function ($ionicHistory, $state) {
        return function () {
            $ionicHistory.clearHistory();
            $ionicHistory.clearCache();
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go('app.dashboard');
        };
    }
])

.service('cancelAndGoBack', [
    '$ionicHistory',
    function ($ionicHistory) {
        return function () {
            $ionicHistory.goBack();
        };
    }
])

.service('loading', [
    '$ionicLoading',
    function ($ionicLoading) {
        return {
            show: function () {
                $ionicLoading.show({
                    template: 'Loading...'
                });
            },
            hide: function () {
                $ionicLoading.hide();
            }
        };
    }
])

;
