'use strict';

/**
 * @ngdoc function
 * @name itprojApp.controller:CheckerSalesCtrl
 * @description
 * # CheckerSalesCtrl
 * Controller of the itprojApp
 */
angular.module('itprojApp')
  .controller('CheckerSalesCtrl', ['$scope', 'userService', function ($scope, userService) {
    $scope.username = userService.getUser().user;
  }]);

