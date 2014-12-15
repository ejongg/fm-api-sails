'use strict';

/**
 * @ngdoc function
 * @name itprojApp.controller:CashierSalesCtrl
 * @description
 * # CashierSalesCtrl
 * Controller of the itprojApp
 */
angular.module('itprojApp')
  .controller('CashierSalesCtrl', ['$scope', 'userService', function ($scope, userService) {
    $scope.username = userService.getUser().user;
  }]);
