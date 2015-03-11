'use strict';

angular.module('fmApp')
.controller('CustomersCtrl',['$scope','$sailsSocket','_','$http', function($scope, $sailsSocket, _, $http){
	$scope.customers = [];
  $scope.orders = {};

  $scope.customerOrders = false;

	var getCustomers = function () {
      $sailsSocket.get('/customers').success(function (data) {
      $scope.customers = data;
      }).error(function (err) {
      console.log(err);
      });
	};
  getCustomers();

  $scope.showCustomerOrders = function (data) {
    $scope.customerOrders = data;
  };
  
  $scope.getCustomerOrders = function (customerId) {
    $http.get('http://localhost:1337/customer_orders?where={"customer_id" :' + customerId + '}').success(function(data){
      $scope.orders  = data;
       $scope.showCustomerOrders(true);
    });
  };
	
}]);

