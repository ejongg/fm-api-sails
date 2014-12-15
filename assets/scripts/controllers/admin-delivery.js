'use strict';

/**
 * @ngdoc function
 * @name itprojApp.controller:AdminDeliveryCtrl
 * @description
 * # AdminDeliveryCtrl
 * Controller of the itprojApp
 */
angular.module('itprojApp')
  .controller('AdminDeliveryCtrl', ['$scope','userService', function ($scope, userService) {
  	$scope.username = userService.getUser().user;
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  }]);
