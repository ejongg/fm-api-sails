'use strict';

/**
 * @ngdoc function
 * @name itprojApp.controller:CheckerLoadinCtrl
 * @description
 * # CheckerLoadinCtrl
 * Controller of the itprojApp
 */
angular.module('itprojApp')
  .controller('CheckerLoadinCtrl', ['$scope', 'userService', function ($scope, userService) {
    $scope.username = userService.getUser().user;
  }]);
