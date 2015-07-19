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
        var apiBase = APIUrl;
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
                        url: apiBase + '/notepads?insidecats=1',
                        method: 'GET',
                        cache: false
                    });
                },
                getById: function (id) {
                    return $http({
                        url: apiBase + '/notepads/' + id,
                        method: 'GET',
                        cache: false
                    });
                },
                add: function(notepad) {
                    return $http({
                        url: apiBase + '/notepads',
                        data: notepad,
                        method: 'POST',
                        cache: false
                    });
                },
                update: function(notepad) {
                    return $http({
                        url: apiBase + '/notepads/' + notepad._id,
                        data: notepad,
                        method: 'PUT',
                        cache: false
                    });
                },
                remove: function(id) {
                    return $http({
                        url: apiBase + '/notepads/' + id,
                        method: 'DELETE',
                        cache: false
                    });
                }
            },
            categories: {
                list: function() {
                    //console.log('categories list() called');
                    return $http({
                        url: apiBase + '/categories',
                        method: 'GET',
                        cache: false
                    });
                },
                getById: function (id) {
                    return $http({
                        url: apiBase + '/categories/' + id,
                        method: 'GET',
                        cache: false
                    });
                },
                add: function(category) {
                    return $http({
                        url: apiBase + '/categories',
                        data: category,
                        method: 'POST',
                        cache: false
                    });
                },
                update: function(category) {
                    return $http({
                        url: apiBase + '/categories/' + category._id,
                        data: category,
                        method: 'PUT',
                        cache: false
                    });
                },
                remove: function(id) {
                    return $http({
                        url: apiBase + '/categories/' + id,
                        method: 'DELETE',
                        cache: false
                    });
                }
            }
        };
    }
])

.service('clearHistory', [
    '$ionicHistory',
    function ($ionicHistory) {
        return function () {
            $ionicHistory.clearHistory();
            $ionicHistory.clearCache();
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
        };
    }
])

.service('goToDashboard', [
    'clearHistory', '$state',
    function (clearHistory, $state) {
        return function () {
            clearHistory();
            $state.go('app.dashboard');
        };
    }
])

.service('goToCategories', [
    'clearHistory', '$state', '$ionicHistory',
    function (clearHistory, $state, $ionicHistory) {
        return function () {
            //clearHistory();
            //$state.go('app.dashboard');
            //remove the add/edit cat from the history //rearrange history
            $ionicHistory.currentView($ionicHistory.backView());
            $state.go('app.categories');
        };
    }
])

.service('cancelAndGoBack', [
    '$ionicHistory', '$state', 'clearHistory',
    function ($ionicHistory, $state, clearHistory) {
        return function (customState) {
            if ($ionicHistory.viewHistory().backView) {
                $ionicHistory.goBack();
            } else {
                //workaround when history is deleted
                clearHistory();
                $state.go(customState ? customState : 'app.dashboard');
            }
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
                    //duration: 10s ?
                });
            },
            hide: function () {
                $ionicLoading.hide();
            }
        };
    }
])

;
