'use strict';

/**
 * @ngdoc function
 * @name itprojApp.controller:CheckerAdjustmentCtrl
 * @description
 * # CheckerAdjustmentCtrl
 * Controller of the itprojApp
 */
angular.module('itprojApp')
  .controller('CheckerAdjustmentCtrl', ['$scope', 'userService', function ($scope, userService) {
    $scope.username = userService.getUser().user;
  }]);
