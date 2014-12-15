'use strict';

/**
 * @ngdoc overview
 * @name itprojApp
 * @description
 * # itprojApp
 *
 * Main module of the application.
 */
angular
  .module('itprojApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/home', {
        templateUrl: 'views/admin-home.html',
        controller: 'AdminHomeCtrl'
      })
      .when('/admin/sales', {
        templateUrl: 'views/admin-sales.html',
        controller: 'AdminSalesCtrl'
      })
      .when('/admin/inventory', {
        templateUrl: 'views/admin-inventory.html',
        controller: 'AdminInventoryCtrl'
      })
      .when('/admin/account', {
        templateUrl: 'views/admin-users.html',
        controller: 'AdminUsersCtrl'
      })
      .when('/', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/encoder/inventory', {
        templateUrl: 'views/encoder-home.html',
        controller: 'EncoderHomeCtrl'
      })
      .when('/encoder/sales', {
        templateUrl: 'views/encoder-sales.html',
        controller: 'EncoderSalesCtrl'
      })
      .when('/encoder/account', {
        templateUrl: 'views/encoder-account.html',
        controller: 'EncoderAccountCtrl'
      })
      .when('/cashier/sales', {
        templateUrl: 'views/cashier-sales.html',
        controller: 'CashierSalesCtrl'
      })
      .when('/checker/tally', {
        templateUrl: 'views/checker-tally.html',
        controller: 'CheckerTallyCtrl'
      })
      .when('/checker/loadIn', {
        templateUrl: 'views/checker-loadin.html',
        controller: 'CheckerLoadinCtrl'
      })
      .when('/checker/adjustment', {
        templateUrl: 'views/checker-adjustment.html',
        controller: 'CheckerAdjustmentCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .controller('MainCtrl',['$scope' , '$location', 'userService','authService','productService', function ($scope, $location, userService, authService, productService) {
   $scope.sidebarClicked = true;
   $scope.category = 1;
   $scope.settings = false;

   productService.getAllVariants('/fm-api/products');
   productService.getAllProducts('/fm-api/products/list');

   $scope.toggle = function () {
     if ($scope.sidebarClicked === true) {
       $scope.sidebarClicked = false;
     }else {
       $scope.sidebarClicked = true;
     }
   };


   $scope.adminSelectCategory = function (category) {
     switch(category){
      case 1:
        $location.path('/admin/sales');
        $scope.category = 1;       
        break;
      case 2:
        $location.path('/admin/inventory');
        $scope.category = 2; 
        break;
      case 3: 
        $location.path('/admin/account');
        $scope.category = 3;  
    }
   };

    $scope.encoderSelectCategory = function (category) {
     switch(category){
      case 1:
        $location.path('/encoder/inventory');
        $scope.category = 1;       
        break;
      case 2: 
        $location.path('/encoder/sales');
        $scope.category = 2; 
        break;
      case 3:
        $location.path('/encoder/account');
        $scope.category = 3; 
    }
   };

   $scope.cashierSelectCategory = function (category) {
     switch(category){
      case 1:
        $location.path('/checker/tally');
        $scope.category = 1;       
        break;
      case 2: 
        $location.path('/checker/loadIn');
        $scope.category = 2; 
        break;
      case 3:
        $location.path('/checker/adjustment');
        $scope.category = 3; 
    }
   };

   $scope.logout = function () {
     var user = userService.getUser().user;
     var username = user.userName;

     authService.logout('/fm-api/users/logout', username).success(function (data) {
       console.log(data+'data');
       $scope.sidebarClicked = true;
       $scope.category = 1;
       $scope.settings = false;
       $location.path('/');
     });

   };

  }]);
