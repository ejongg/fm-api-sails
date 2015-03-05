'use strict';

angular.module('fmApp')
.controller('CustomersCtrl',['$scope','$sailsSocket','_', function($scope, $sailsSocket, _){
	$scope.distanceRatings = [1,2,3,4,5];
	$scope.customers = [];

	$scope.customer = {};
  $scope.customerEdit = {};
  $scope.customerDelete = {};
  $scope.copiedCustomer = {};

	$scope.addCustomerForm = false;
	$scope.editOrDeleteCustomerForm = false;
	$scope.editCustomerTab = true;

	var getCustomers = function () {
      $sailsSocket.get('/customers').success(function (data) {
      $scope.customers = data;
      }).error(function (err) {
      console.log(err);
      });
	};

    getCustomers();

	$scope.showAddCustomerForm = function (data) {
      $scope.addCustomerForm = data;
      if($scope.editOrDeleteCustomerForm === true) {
        $scope.showEditOrDeleteCustomerForm(false);
      }
      if(data === false){
        clearForm();
      }
	};

	$scope.showEditOrDeleteCustomerForm = function (data) {
      $scope.editOrDeleteCustomerForm = data;
	};

	$scope.setEditCustomerTab = function (data) {
      $scope.editCustomerTab = data;
      if(data === true){
        $scope.customerEdit.establishment_name = $scope.copiedCustomer.establishment_name;
        $scope.customerEdit.owner_name = $scope.copiedCustomer.owner_name;
        $scope.customerEdit.address = $scope.copiedCustomer.address;
        $scope.customerEdit.distance_rating = $scope.copiedCustomer.distance_rating;
      } 
	};
    
  $scope.customerClicked = function (customer) {
    if($scope.addCustomerForm === true){
      $scope.showAddCustomerForm(false);
    }
    $scope.copiedCustomer = angular.copy(customer);
    $scope.customerEdit.id = $scope.copiedCustomer.id;
    $scope.customerEdit.establishment_name = $scope.copiedCustomer.establishment_name;
    $scope.customerEdit.owner_name = $scope.copiedCustomer.owner_name;
    $scope.customerEdit.address = $scope.copiedCustomer.address;
    $scope.customerEdit.distance_rating = $scope.copiedCustomer.distance_rating;

    $scope.customerDelete.id = $scope.copiedCustomer.id;
    $scope.customerDelete.establishment_name = $scope.copiedCustomer.establishment_name;
    $scope.customerDelete.owner_name = $scope.copiedCustomer.owner_name;
    $scope.customerDelete.address = $scope.copiedCustomer.address;
    $scope.customerDelete.distance_rating = $scope.copiedCustomer.distance_rating;

    $scope.showEditOrDeleteCustomerForm(true);
  };

  var clearForm = function () {
    $scope.customer.establishment_name = '';
    $scope.customer.owner_name = '';
    $scope.customer.address = '';
    $scope.customer.distance_rating = $scope.distanceRatings[0];
  }; 

	$scope.addCustomer = function (customer) {
      console.log(customer);
      $sailsSocket.post('/customers', customer).success(function (data) {
      console.log(data);
      $scope.customers.push(data);
      $scope.showAddCustomerForm(false);
      clearForm();
      }).error(function (err) {
      console.log(err);
      });
	}; 

	$scope.editCustomer = function (newInfo) {
      $sailsSocket.put('/customers/' + newInfo.id, newInfo).success(function (data) {
        var index = _.findIndex($scope.customers, function(customer) { return customer.id == data.id; });
        $scope.customers[index] = data;
        $scope.showEditOrDeleteCustomerForm(false);
      }).error(function (err) {
        console.log(err);
      });
	};

	$scope.deleteCustomer = function (customer) {
      $sailsSocket.delete('/customers/' + customer.id).success(function (data) {
        var index = _.findIndex($scope.customers, function(customer) { return customer.id == data.id; });
        $scope.customers.splice(index,1);
        $scope.showEditOrDeleteCustomerForm(false);
      }).error(function (err) {
        console.log(err);
      });
	};
}]);

