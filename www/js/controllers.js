'use strict';

angular.module('Notepads.controllers', [])

.controller('MainCtrl', [
    '$scope', /*'$facebook', */'$http', '$ionicLoading', '$state', 'User', 'goToDashboard',
    function ($scope, /*$facebook, */$http, $ionicLoading, $state, User, goToDashboard) {

        function initUser(fbId, name, fbAccessToken, cb) {
            console.log('initUser() called', fbId, name, fbAccessToken);
            Api.users.auth(fbId, fbAccessToken)
                .success(function (data) {
                    User.create(fbId, name, data.accessToken);
                    $scope.isLoggedIn = true;
                    $ionicLoading.hide();
                    if ("function" === typeof cb) {
                        cb();
                    }
                })
                .error(function (data, status) {
                    $ionicLoading.hide();
                    $scope.appError = 'initUser error ' + status + ', ' + data;
                    console.log($scope.appError);
                });
        }

        $scope.login = function () {
            $facebook.login().then(function (loginResponse) {
                $facebook.api('/me').then(
                    function (meResponse) {
                        initUser(
                            meResponse.id,
                            meResponse.name,
                            loginResponse.authResponse.accessToken
                        );
                    },
                    function (err) {
                        console.log('error', err);
                    }
                );
            });
        };

        //start

        $ionicLoading.show({
            template: 'Loading...'
        });

        $scope.isLoggedIn = false;

        var user = User.get();
        console.log('user from storage', JSON.stringify(user));
        if (!user || !user.facebookId) {
            console.log('getting new user from FB');
            $facebook.api('/me').then(
                function (meResponse) {
                    console.log('user already logged in FB');
                    $scope.isLoggedIn = true;
                    var authResponse = $facebook.getAuthResponse();
                    initUser(
                        meResponse.id,
                        meResponse.name,
                        authResponse.accessToken,
                        goToDashboard
                    );
                },
                function (err) {
                    $scope.isLoggedIn = false;
                    $ionicLoading.hide();
                    console.log('user not logged in FB', err);
                }
            );
        } else {
            console.log('local user exists');
            $scope.isLoggedIn = true;
            $ionicLoading.hide();
            goToDashboard();
        }

    }
])

.controller('DashboardCtrl', [
    '$scope', /*'$facebook', */'$http', '$ionicLoading', 'Api',
    function ($scope, /*$facebook, */$http, $ionicLoading, Api) {

        var getNotepads = function (cb) {
            $ionicLoading.show({
                template: 'Loading...'
            });

            Api.notepads.list().success(function (data) {
                    $scope.cats = data;
                    console.log('notepads from API', JSON.stringify(data));
                    $ionicLoading.hide();
                    if ("function" === typeof cb) {
                        cb();
                    }
            }).error(function (data, status, headers, object) {
                console.log('notepads api list error', data, status, headers, JSON.stringify(object));
            });
        };

        getNotepads();

    }
])

.controller('NotepadCtrl', [
    '$scope', '$stateParams', 'Api', '$ionicLoading',
    function ($scope, $stateParams, Api, $ionicLoading) {

        $ionicLoading.show({
            template: 'Loading...'
        });

        Api.notepads.getById($stateParams.id)
            .success(function (notepad) {
                console.log('notepad from API', JSON.stringify(notepad));
                //notepad.text = notepad.text.replace(/(?:\r\n|\r|\n)/g, '<br/>');
                notepad.text = notepad.text.replace(/$/mg, '<br/>');
                $scope.notepad = notepad;
                $ionicLoading.hide();
            });
    }
])

.controller('NotepadEditCtrl', [
    '$scope', '$stateParams', 'Api', 'goToDashboard', 'loading', 'cancelAndGoBack',
    function ($scope, $stateParams, Api, goToDashboard, loading, cancelAndGoBack) {

        $scope.update = function () {
            loading.show();

            if ($stateParams.id) {
                Api.notepads.update($scope.notepad).success(function (notepad) {
                    $ionicLoading.hide();
                    console.log('notepad updated', notepad);
                    goToDashboard();
                });
            } else {
                console.log('sending api notepads add', $scope.notepad);
                Api.notepads.add($scope.notepad).success(function (notepad) {
                    loading.hide();
                    console.log('notepad added', notepad);
                    goToDashboard();
                });
            }
        };

        $scope.cancel = function () {
            cancelAndGoBack();
        };

        if ($stateParams.id) {
            $scope.topTitle = 'Edit';
            $scope.btnTxt = 'Update';
        } else {
            $scope.notepad = {category: '', title: '', text: ''};
            $scope.topTitle = 'Add';
            $scope.btnTxt = 'Add';
            $scope.isAdd = true;
        }

        loading.show();

        Api.categories.list().success(function (categories) {
            $scope.categories = categories;
            if ($stateParams.id) {
                Api.notepads.getById($stateParams.id)
                    .success(function (notepad) {
                        console.log('notepad from API', notepad);
                        $scope.notepad = notepad;
                        loading.hide();
                    });
            } else {
                loading.hide()();
            }
        }).error(function (data, status, headers, object) {
            loading.hide();
            console.log('categories list err', data, status, headers, JSON.stringify(object));
        });

    }
])

.controller('NotepadDelCtrl', [
    '$scope', '$stateParams', 'Api', '$ionicLoading', 'goToDashboard', 'cancelAndGoBack',
    function ($scope, $stateParams, Api, $ionicLoading, goToDashboard, cancelAndGoBack) {

        $scope.delete = function () {
            $ionicLoading.show({
                template: 'Loading...'
            });
            Api.notepads.remove($scope.notepad._id).success(function (notepad) {
                $ionicLoading.hide();
                console.log('notepad deleted', notepad);
                goToDashboard();
            });
        };

        $scope.cancel = function () {
            cancelAndGoBack();
        };

        $ionicLoading.show({
            template: 'Loading...'
        });

        Api.notepads.getById($stateParams.id)
            .success(function (notepad) {
                console.log('notepad from API', notepad);
                $scope.notepad = notepad;
                $ionicLoading.hide();
            });
    }
])

;
