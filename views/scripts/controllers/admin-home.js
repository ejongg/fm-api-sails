'use strict';

/**
 * @ngdoc function
 * @name itprojApp.controller:AdminHomeCtrl
 * @description
 * # AdminHomeCtrl
 * Controller of the itprojApp
 */
angular.module('itprojApp')
  .controller('AdminHomeCtrl', ['$scope', '$location', 'userService', function ($scope, $location, userService) {
  	$scope.username = userService.getUser().user;
   
  }]);
