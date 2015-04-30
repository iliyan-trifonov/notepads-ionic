'use strict';

angular.module('Notepads', [
    'ionic',
    'Notepads.controllers',
    'Notepads.services',
    'ngSanitize'
])

.constant('APIUrl', NotepadsConfig.APIURL)
.constant('mockUser', NotepadsConfig.mockUser)

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    $ionicConfigProvider.views.transition('none');

    $stateProvider

        .state('app', {
            url: "/app",
            abstract: true,
            templateUrl: "templates/menu.html",
            controller: 'AppCtrl'
        })

        .state('app.dashboard', {
            url: "/dashboard",
            views: {
                'menuContent': {
                    templateUrl: "templates/dashboard.html",
                    controller: 'DashboardCtrl'
                }
            }
        })

        .state('app.guestindex', {
            url: '/guestindex',
            views: {
                'menuContent': {
                    templateUrl: 'templates/main.html',
                    controller: 'MainCtrl'
                }
            }
        })

        .state('app.notepadsadd', {
            url: '/notepads/add',
            views: {
                'menuContent': {
                    templateUrl: 'templates/notepad-edit.html',
                    controller: 'NotepadEditCtrl'
                }
            }
        })

        .state('app.notepadaddwithcat', {
            url: '/notepads/add/catid/:cid',
            views: {
                'menuContent': {
                    templateUrl: 'templates/notepad-edit.html',
                    controller: 'NotepadEditCtrl'
                }
            }
        })

        .state('app.notepadview', {
            url: '/notepads/:id',
            views: {
                'menuContent': {
                    templateUrl: 'templates/notepad.html',
                    controller: 'NotepadCtrl'
                }
            }
        })

        .state('app.notepadedit', {
            url: '/notepads/:id/edit',
            views: {
                'menuContent': {
                    templateUrl: 'templates/notepad-edit.html',
                    controller: 'NotepadEditCtrl'
                }
            }
        })

        .state('app.notepaddel', {
            url: '/notepads/:id/delete',
            views: {
                'menuContent': {
                    templateUrl: 'templates/notepad-delete.html',
                    controller: 'NotepadDelCtrl'
                }
            }
        })

        .state('app.categories', {
            url: '/categories',
            views: {
                'menuContent': {
                    templateUrl: 'templates/categories.html',
                    controller: 'CategoriesCtrl'
                }
            }
        })

        .state('app.categoriesadd', {
            url: '/categories/add',
            views: {
                'menuContent': {
                    templateUrl: 'templates/category-edit.html',
                    controller: 'CategoryEditCtrl'
                }
            }
        })

        .state('app.categoriesedit', {
            url: '/categories/:cid/edit',
            views: {
                'menuContent': {
                    templateUrl: 'templates/category-edit.html',
                    controller: 'CategoryEditCtrl'
                }
            }
        })

        .state('app.categoriesdelete', {
            url: '/categories/:cid/delete',
            views: {
                'menuContent': {
                    templateUrl: 'templates/category-delete.html',
                    controller: 'CategoryDelCtrl'
                }
            }
        })
    ;
    $urlRouterProvider.otherwise('/app/guestindex');
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
