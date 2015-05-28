'use strict';

angular.module('fmApp')
.controller('CustomersCtrl',['$scope','_','$http','httpHost', 'authService', function($scope, _, $http, httpHost, authService){
	$scope.customers = [];
  $scope.orders = {};

  $scope.customerOrders = false;

  $scope.noCustomers = false;

  // forSorting
  $scope.sortCriteria='id';
  $scope.reverseSort = false;

	var getCustomers = function () {
    $http.get(httpHost + '/customers').success( function (data) {
      if(data.length !== 0){
        $scope.customers = data;
        console.log("Customers:");
        console.log($scope.customers);
      }else{
        $scope.noCustomers = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
	};
  
  getCustomers();

  $scope.showCustomerOrders = function (data) {
    $scope.customerOrders = data;
  };
  
  $scope.getCustomerOrders = function (customerId) {
    $http.get(httpHost + '/customer_orders?where={"customer_id" :' + customerId + '}').success( function (data) {
      $scope.orders = data;
      $scope.showCustomerOrders(true);
    }).error(function (err) {
      console.log(err);
    });
  };

  io.socket.on('customers', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);

    switch (msg.verb) {
      case "created": 
        console.log("Customer Created");
        $scope.customers.push(msg.data);
        if($scope.noCustomers === true){
          $scope.noCustomers = false;
        }
        $scope.$digest();
    }

  }); 


	
}]);

