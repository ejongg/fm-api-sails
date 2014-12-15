'use strict';

/**
 * @ngdoc function
 * @name itprojApp.controller:CheckerTallyCtrl
 * @description
 * # CheckerTallyCtrl
 * Controller of the itprojApp
 */
angular.module('itprojApp')
  .controller('CheckerTallyCtrl', ['$scope', 'userService', function ($scope, userService) {
    $scope.username = userService.getUser().user;
  }]);

