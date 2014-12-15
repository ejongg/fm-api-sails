'use strict';

/**
 * @ngdoc function
 * @name itprojApp.controller:AdminSalesCtrl
 * @description
 * # AdminSalesCtrl
 * Controller of the itprojApp
 */
angular.module('itprojApp')
  .controller('AdminSalesCtrl', ['$scope', 'userService', function ($scope, userService) {
  	$scope.username = userService.getUser().user;
    $scope.tab = 1;

    $scope.selectTab = function (selectedTab) {
      $scope.tab = selectedTab;
    };
    
  }]);
