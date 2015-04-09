'use strict';

angular.module('fmApp')
.controller('LoadOutsCtrl',['$scope', '_', '$http', 'httpHost','authService','userService','$filter', function($scope, _, $http, httpHost, authService,userService,$filter){
	
  $scope.loadOutNumbers = [1,2,3,4,5];
  $scope.customerOrders = [];
  $scope.loadOuts = [];
  $scope.trucks = [];
  $scope.addLoadOutBox = false;

  var todayDay = new Date();
  todayDay.setDate(todayDay.getDate() + 1);

  

  $scope.loadOut = {};
  $scope.loadOut.orders = [];
  $scope.loadOut.user = userService.getUserName();
  $scope.loadOut.delivery_date = $filter('date')(todayDay,"yyyy-MM-dd");
  
  var getCustomerOrders = function () {
    $http.get(httpHost + '/customer_orders').success( function (data) {
      $scope.customerOrders = data;
      console.log("Customer Orders:");
      console.log($scope.customerOrders);
    }).error(function (err) {
      console.log(err);
    });
  };

  var getTrucks = function () {
    $http.get(httpHost + '/trucks').success( function (data) {
      $scope.trucks = data;
      $scope.loadOut.truck_id = $scope.trucks[0].id;
      console.log("Trucks:");
      console.log($scope.trucks);
    }).error(function (err) {
      console.log(err);
    });
  }

  var getLoadOuts = function () {
    $http.get(httpHost + '/load_out').success( function (data) {
      $scope.loadOuts = data;
      console.log("Load Out:");
      console.log($scope.loadOuts);
    }).error(function (err) {
      console.log(err);
    });
  };

  getCustomerOrders();
  getLoadOuts();
  getTrucks();

  $scope.showAddLoadOutBox = function (data){
    $scope.addLoadOutBox = data;

    if(data === false){
      $scope.loadOut.orders = [];
      $scope.loadOut.truck_id = $scope.trucks[0].id;
      $scope.loadOut.loadout_no = $scope.loadOutNumbers[0];
    }
  };

  $scope.truckName = function (truck) {
    var index = _.findIndex($scope.trucks, truck);
    index += 1;
    return "Truck " + index;
  };

  $scope.onDropComplete = function (data, evt){
    console.log("Dropped");
    console.log(data);
    if(_.findIndex($scope.loadOut.orders,{ 'id': data.id}) === -1 ){
      $scope.loadOut.orders.push(data);
    }else{
      $scope.showExistingAddressInRouteError(true,data.address_name);
    }
  };

  $scope.addLoadOut = function (loadOut) {
    console.log(loadOut);
     io.socket.request($scope.socketOptions('post','/load_out/add',{"Authorization": "Bearer " + authService.getToken()},loadOut), function (body, JWR) {
      console.log('Sails responded with post loadout: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
        $scope.showAddLoadOutBox(false);
        $scope.$digest();
      }
    });  
  };

}]);
