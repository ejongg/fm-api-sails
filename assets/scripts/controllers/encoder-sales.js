'use strict';

/**
 * @ngdoc function
 * @name itprojApp.controller:EncoderSalesCtrl
 * @description
 * # EncoderSalesCtrl
 * Controller of the itprojApp
 */
angular.module('itprojApp')
  .controller('EncoderSalesCtrl', ['$scope', 'userService', function ($scope, userService) {
  	$scope.username = userService.getUser().user;
    $scope.tab = 1;
    $scope.deliveries = [];
    $scope.addDelivery = false;

    $scope.selectTab = function (selectedTab) {
      $scope.tab = selectedTab;
    };
    
  }]);

