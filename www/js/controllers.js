'use strict';

angular.module('Notepads.controllers', [])

.controller('AppCtrl', [
    '$scope', '$state', 'loading', 'goToDashboard', 'User', 'Api', '$ionicHistory',
    function ($scope, $state, loading, goToDashboard, User, Api, $ionicHistory) {

        $scope.login = function () {
            console.log('login() called');
            loading.show();
            facebookConnectPlugin.login([], function (loginResult) {
                console.log('FB success', JSON.stringify(loginResult));
                console.log('calling /me ..');
                facebookConnectPlugin.api('/me?fields=id,name,picture', [],function (meResult) {
                    console.log('/me success', JSON.stringify(meResult));
                    initUser(
                        loginResult.authResponse.userID,
                        meResult.name,
                        meResult.picture.data.url,
                        loginResult.authResponse.accessToken,
                        function () {
                            $scope.user = User.get();
                            goToDashboard();
                        }
                    );
                }, function (result) {
                    console.log('/me error', JSON.stringify(result));
                    loading.hide();
                });
            }, function (error) {
                console.log('FB error', JSON.stringify(error));
                loading.hide();
            });
        };

        //add some history for the back and cancel buttons
        $scope.categories = function () {
            $state.go('app.dashboard');
            $state.go('app.categories');
        };

        //add some history for the back and cancel buttons
        $scope.addNotepad = function () {
            $state.go('app.dashboard');
            $state.go('app.notepadsadd');
        };

        //add some history for the back and cancel buttons
        $scope.addCategory = function () {
            //$state.go('app.categories');
            $state.go('app.categoriesadd');
        };

        $scope.logout = function () {
            User.set({});
            $scope.isLoggedIn = false;
            $ionicHistory.clearHistory();
            $ionicHistory.clearCache();
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go('app.guestindex');
        };

        function initUser(fbId, name, photo, fbAccessToken, cb) {
            console.log('initUser() called', fbId, name, photo, fbAccessToken);
            Api.users.auth(fbId, fbAccessToken)
                .success(function (data) {
                    User.create(fbId, name, photo, data.accessToken);
                    $scope.isLoggedIn = true;
                    loading.hide();
                    if ("function" === typeof cb) {
                        cb();
                    }
                })
                .error(function (data, status) {
                    loading.hide();
                    $scope.appError = 'initUser error ' + status + ', ' + data;
                    console.log($scope.appError);
                });
        }

        $scope.isLoggedIn = false;

        loading.show();

        var user = User.get();
        console.log('user from storage', JSON.stringify(user));
        if (!user || !user.accessToken) {
            console.log('not logged in');
            loading.hide();
        } else {
            console.log('local user exists');
            $scope.user = user;
            $scope.isLoggedIn = true;
            //loading.hide();
            //goToDashboard();
            //$state.go('app.dashboard');
        }

    }
])

.controller('MainCtrl', [
    'User', 'goToDashboard',
    function (User, goToDashboard) {
        console.log('MainCtrl');
        var user = User.get();
        if (user && user.accessToken) {
            goToDashboard();
        }
    }
])

.controller('DashboardCtrl', [
    '$scope', '$http', 'loading', 'Api', '$rootScope',
    function ($scope, $http, loading, Api, $rootScope) {

        var getNotepads = function (cb) {

            loading.show();

            Api.notepads.list().success(function (data) {
                    $scope.cats = data;
                    loading.hide();
                    if ("function" === typeof cb) {
                        cb();
                    }
            }).error(function (data, status, headers, object) {
                console.log('notepads api list error', data, status, headers, JSON.stringify(object));
                //TODO: show error
                loading.hide();
            });
        };

        getNotepads();

        //TODO: put this assign in service and give the function to be executed as a callback
        $rootScope.$on('categoryupdated', function () {
            getNotepads();
        });

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
                //console.log('notepad from API', JSON.stringify(notepad));
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
                    loading.hide();
                    //console.log('notepad updated', notepad);
                    goToDashboard();
                });
            } else {
                console.log('sending api notepads add', $scope.notepad);
                Api.notepads.add($scope.notepad).success(function (notepad) {
                    loading.hide();
                    //console.log('notepad added', notepad);
                    goToDashboard();
                }).error(function (data, status, headers, obj) {
                    console.log('notepad add err', data, status, headers, obj);
                });
            }
        };

        $scope.cancel = function () {
            cancelAndGoBack();
        };

        if ($stateParams.cid) {
            $scope.catId = $stateParams.cid;
        }

        if ($stateParams.id) {
            $scope.topTitle = 'Edit';
            $scope.btnTxt = 'Update';
        } else {
            $scope.notepad = {category: $scope.catId, title: '', text: ''};
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
                        //console.log('notepad from API', notepad);
                        $scope.notepad = notepad;
                        loading.hide();
                    });
            } else {
                loading.hide();
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

        //TODO: rename to remove()
        $scope.remove = function () {
            $ionicLoading.show({
                template: 'Loading...'
            });
            Api.notepads.remove($scope.notepad._id).success(function (notepad) {
                $ionicLoading.hide();
                //console.log('notepad deleted', notepad);
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
                //console.log('notepad from API', notepad);
                $scope.notepad = notepad;
                $ionicLoading.hide();
            });
    }
])

.controller('CategoriesCtrl', [
    '$scope', 'Api', '$rootScope',
    function ($scope, Api, $rootScope) {

        function getCatsList() {
            Api.categories.list().success(function (categories) {
                $scope.categories = categories;
            });
        }

        $rootScope.$on('categoryupdated', function () {
            getCatsList();
        });

        getCatsList();

    }
])

.controller('CategoryEditCtrl', [
    '$scope', 'Api', '$stateParams', 'loading', 'cancelAndGoBack', '$state', '$rootScope', 'goToCategories',
    function ($scope, Api, $stateParams, loading, cancelAndGoBack, $state, $rootScope, goToCategories) {

        var catId = $stateParams.cid;

        if (catId) {
            $scope.topTitle = 'Edit';
            $scope.btnTxt = 'Update';
            loading.show();
            Api.categories.getById(catId).success(function (category) {
                $scope.category = category;
                loading.hide();
            });
        } else {
            $scope.isAdd = true;
            $scope.topTitle = 'Add';
            $scope.btnTxt = 'Add';
            $scope.category = {name: ''};
        }

        $scope.update = function () {
            if (catId) {
                Api.categories.update($scope.category).success(function (category) {
                    $rootScope.$emit('categoryupdated', 1);
                    goToCategories();
                });
            } else {
                Api.categories.add($scope.category).success(function (category) {
                    //TODO: put these 2 lines in a global function/service
                    $rootScope.$emit('categoryupdated', 1);
                    goToCategories();
                });
            }
        };

        $scope.cancel = cancelAndGoBack;

    }
])

.controller('CategoryDelCtrl', [
        '$scope', 'loading', '$stateParams', 'cancelAndGoBack', 'Api', '$rootScope', '$state',
        function ($scope, loading, $stateParams, cancelAndGoBack, Api, $rootScope, $state) {
            Api.categories.getById($stateParams.cid).success(function (category) {
                $scope.category = category;
            });

            $scope.remove = function () {
                Api.categories.remove($stateParams.cid).success(function (category) {
                    $rootScope.$emit('categoryupdated', 1);
                    $state.go('app.categories');
                });
            };

            $scope.cancel = function () {
                cancelAndGoBack();
            };
        }
    ])

;
