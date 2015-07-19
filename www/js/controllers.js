'use strict';

angular.module('Notepads.controllers', [])

.controller('AppCtrl', [
    '$scope', '$state', 'loading', 'goToDashboard', 'User', 'Api', '$ionicHistory', '$ionicPlatform', 'mockUser',
    function ($scope, $state, loading, goToDashboard, User, Api, $ionicHistory, $ionicPlatform, mockUser) {

        $scope.login = function () {
            //console.log('login() called');
            loading.show();
            facebookConnectPlugin.login([], function (loginResult) {
                //console.log('FB success', JSON.stringify(loginResult));
                //console.log('calling /me ..');
                facebookConnectPlugin.api('/me?fields=id,name,picture', [],function (meResult) {
                    //console.log('/me success', JSON.stringify(meResult));
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
                }, function (/*result*/) {
                    //console.log('/me error', JSON.stringify(result));
                    loading.hide();
                });
            }, function (/*error*/) {
                //console.log('FB error', JSON.stringify(error));
                loading.hide();
            });
        };

        //add some history for the back and cancel buttons
        $scope.categories = function () {
            //$state.go('app.dashboard');
            $state.go('app.categories');
        };

        //add some history for the back and cancel buttons
        $scope.addNotepad = function () {
            //$state.go('app.dashboard');
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
            //console.log('initUser() called', fbId, name, photo, fbAccessToken);
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
                    //console.log($scope.appError);
                });
        }

        $scope.isLoggedIn = false;

        $ionicPlatform.ready(function() {
            //mock (alfa)
            //for testing in the browser
            if ('undefined' === typeof facebookConnectPlugin) {
                $scope.isLoggedIn = true;
                //fake user that can access the API
                User.create(
                    mockUser.fbId,
                    mockUser.name,
                    mockUser.photo,
                    mockUser.accessToken
                );
            }
        });

        loading.show();

        var user = User.get();
        //console.log('user from storage', JSON.stringify(user));
        if (!user || !user.accessToken) {
            //console.log('not logged in');
            loading.hide();
        } else {
            //console.log('local user exists');
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
        //console.log('MainCtrl');
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
                //console.log('notepads api list error', data, status, headers, JSON.stringify(object));
                //TODO: show error
                loading.hide();
            });
        };

        getNotepads();

        //TODO: put this assign in service and give the function to be executed as a callback
        $rootScope.$on('categoryupdated', function () {
            getNotepads();
        });
        $rootScope.$on('notepadupdated', function () {
            getNotepads();
        });

    }
])

.controller('NotepadCtrl', [
    '$scope', '$stateParams', 'Api', '$ionicLoading', 'loading',
    function ($scope, $stateParams, Api, $ionicLoading, loading) {

        loading.show();

        Api.notepads.getById($stateParams.id)
            .success(function (notepad) {
                //console.log('notepad from API', JSON.stringify(notepad));
                $scope.notepad = notepad;
                loading.hide();
            });
    }
])

.controller('NotepadEditCtrl', [
    '$scope', '$stateParams', 'Api', 'goToDashboard', 'loading', 'cancelAndGoBack', '$rootScope', '$log',
    function ($scope, $stateParams, Api, goToDashboard, loading, cancelAndGoBack, $rootScope, $log) {

        $scope.update = function () {
            loading.show();

            if ($stateParams.id) {
                Api.notepads.update($scope.notepad).success(function (/*notepad*/) {
                    loading.hide();
                    $rootScope.$emit('notepadupdated', 1);
                    goToDashboard();
                });
            } else {
                Api.notepads.add($scope.notepad).success(function (/*notepad*/) {
                    loading.hide();
                    $rootScope.$emit('notepadupdated', 1);
                    goToDashboard();
                }).error(function (data, status, headers, obj) {
                    $log.error('notepad add err', data, status, headers, obj);
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
            $log.error('categories list err', data, status, headers, JSON.stringify(object));
        });

    }
])

.controller('NotepadDelCtrl', [
    '$scope', '$stateParams', 'Api', '$ionicLoading', 'goToDashboard', 'cancelAndGoBack', 'loading', '$rootScope',
    function ($scope, $stateParams, Api, $ionicLoading, goToDashboard, cancelAndGoBack, loading, $rootScope) {

        //TODO: rename to remove()
        $scope.remove = function () {
            loading.show();
            Api.notepads.remove($scope.notepad._id).success(function (/*notepad*/) {
                loading.hide();
                $rootScope.$emit('notepadupdated', 1);
                goToDashboard();
            });
        };

        $scope.cancel = function () {
            cancelAndGoBack();
        };

        loading.show();

        //TODO: add error + loading hide/err popup
        Api.notepads.getById($stateParams.id)
            .success(function (notepad) {
                $scope.notepad = notepad;
                loading.hide();
            });
    }
])

.controller('CategoriesCtrl', [
    '$scope', 'Api', '$rootScope', 'loading', '$state',
    function ($scope, Api, $rootScope, loading, $state) {

        function getCatsList() {
            Api.categories.list().success(function (categories) {
                $scope.categories = categories;
                loading.hide();
            });
        }

        $rootScope.$on('categoryupdated', function () {
            getCatsList();
        });

        //trying some things with the history from #/app/categories
        $scope.editCat = function (catId) {
            $state.go('app.categoriesedit', { cid: catId });
        };

        $scope.deleteCat = function (catId) {
            $state.go('app.categoriesdelete', { cid: catId });
        };

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

        $scope.cancel = function () {
            cancelAndGoBack('app.categories');
        };

    }
])

.controller('CategoryDelCtrl', [
        '$scope', 'loading', '$stateParams', 'cancelAndGoBack', 'Api', '$rootScope', 'goToCategories',
        function ($scope, loading, $stateParams, cancelAndGoBack, Api, $rootScope, goToCategories) {
            Api.categories.getById($stateParams.cid).success(function (category) {
                $scope.category = category;
                loading.hide();
            });

            $scope.remove = function () {
                Api.categories.remove($stateParams.cid).success(function (/*category*/) {
                    $rootScope.$emit('categoryupdated', 1);
                    goToCategories();
                });
            };

            $scope.cancel = function () {
                cancelAndGoBack('app.categories');
            };
        }
    ])

;
