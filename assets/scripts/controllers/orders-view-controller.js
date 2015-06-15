'use strict';

angular.module('fmApp')
.controller('OrdersViewCtrl',['$scope','_','$http','httpHost', 'authService','userService','$modal','$interval', '$filter','$state','$stateParams',
  function($scope, _, $http, httpHost, authService,userService,$modal,$interval,$filter,$state,$stateParams){
  var orderID = $stateParams.orderID;
  $scope.order = {};

  var getOrder = function () {
   $http.get(httpHost + '/customer-orders/details?id=' + orderID).success( function (data) {  
      $scope.order = data;
      console.log($scope.order);
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  getOrder();

}]);





