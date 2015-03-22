'use strict';

angular.module('fmApp')
.controller('CustomersCtrl',['$scope','_','$http', function($scope, _, $http){
	$scope.customers = [];
  $scope.orders = {};

  $scope.customerOrders = false;

	var getCustomers = function () {
      // $sailsSocket.get('/customers').success(function (data) {
      // $scope.customers = data;
      // }).error(function (err) {
      // console.log(err);
      // });
    io.socket.request($scope.socketOptions('get','/customers'), function (body, JWR) {
      console.log('Sails responded with get customers: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.customers = body;
        $scope.$digest();
      }
    });
	};
  getCustomers();

  $scope.showCustomerOrders = function (data) {
    $scope.customerOrders = data;
  };
  
  $scope.getCustomerOrders = function (customerId) {
    // $http.get('http://localhost:1337/customer_orders?where={"customer_id" :' + customerId + '}').success(function(data){
    //   $scope.orders  = data;
    //   $scope.showCustomerOrders(true);
    // });
    io.socket.request($scope.socketOptions('get','/customer_orders?where={"customer_id" :' + customerId + '}'), function (body, JWR) {
      console.log('Sails responded with get customers: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.orders = body;
        $scope.showCustomerOrders(true);
        $scope.$digest();
      }
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
        $scope.$digest();
    }

  }); 


	
}]);

