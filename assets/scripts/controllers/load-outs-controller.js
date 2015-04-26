'use strict';

angular.module('fmApp')
.controller('LoadOutsCtrl',['$scope', '_', '$http', 'httpHost','authService','userService','$filter', function($scope, _, $http, httpHost, authService,userService,$filter){
	
  $scope.loadOutNumbers = [1,2,3,4,5];
  $scope.customerOrders = [];
  $scope.customerOrdersAvailable = [];
  $scope.loadOuts = [];
  $scope.trucks = [];
  $scope.addLoadOutBox = false;

  $scope.noTrucks = false;
  $scope.noCustomerOrders = false;
  $scope.noCustomerOrdersAvailable = false;
  $scope.noLoadOut = false;

  $scope.editIndex = -1;

  var todayDay = new Date();
  todayDay.setDate(todayDay.getDate() + 1);
  var todayDayFormatted = $scope.formatDate(todayDay);

  $scope.loadOut = {};
  $scope.loadOut.orders = [];
  $scope.loadOut.user = '';
  $scope.loadOut.delivery_date = todayDayFormatted;
  $scope.loadOut.flag = "add";

  $scope.sortCriteria = '';
  

  var getCustomerOrders = function () {
    $http.get(httpHost + '/customer_orders').success( function (data) {
     
      if(data.length !== 0){
        $scope.customerOrders = data;
        console.log("Customer Orders:");
        console.log($scope.customerOrders);
      }else{
        $scope.noCustomerOrders = true;
      }

    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  var getCustomerOrdersAvailable = function () {
    $http.get(httpHost + '/customer-orders/list').success( function (data) {

      if(data.length !== 0){
        $scope.customerOrdersAvailable = data;
        $scope.ordersAvailableList = $scope.customerOrdersAvailable[0];
         $scope.ordersAvailableListEdit = $scope.customerOrdersAvailable[0];
        console.log("Customer Orders Available:");
        console.log($scope.customerOrdersAvailable);
      }else{
        $scope.noCustomerOrdersAvailable = true;
      }

    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  var getTrucks = function () {
    $http.get(httpHost + '/trucks').success( function (data) {
      
      if(data.length !== 0){
        $scope.trucks = data;
        $scope.loadOut.truck = $scope.trucks[0];
        console.log("Trucks:");
        console.log($scope.trucks);
      }else{
        $scope.noTrucks = true;
      }
      
    }).error(function (err) {
      $scope.checkError(err);
    });
  }

  var getLoadOuts = function () {
    $http.get(httpHost + '/load_out/list').success( function (data) {
      if(data.length !== 0){
        $scope.loadOuts = data;
        console.log("Load Out:");
        console.log($scope.loadOuts);
      }else{
        $scope.noLoadOut = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  getCustomerOrders();
  getCustomerOrdersAvailable();
  getLoadOuts();
  getTrucks();
  
  $scope.setEditLoadOut = function (index) {
    $scope.editIndex = index;
  };

  $scope.showAddLoadOutBox = function (data){
    $scope.addLoadOutBox = data;
    if(data === true){
      if($scope.loadOut.truck){
        $scope.dropdownChange($scope.loadOut.truck);
      }
    }

    if(data === false){
      $scope.loadOut.orders = [];
      $scope.loadOut.loadout_no = $scope.loadOutNumbers[0];
      $scope.loadOutNumbers = [1,2,3,4,5];
      if($scope.noTrucks === false){
        $scope.loadOut.truck_id = $scope.trucks[0].id;
      }
    }
  };

  $scope.getTruckNumber = function (truck_id) {
    var index = _.findIndex($scope.trucks, {'id': truck_id});
    index += 1;
    return "Truck " + index;
  };

  $scope.truckName = function (truck) {
    var index = _.findIndex($scope.trucks, truck);
    index += 1;
    return "Truck " + index;
  };

  $scope.addAvaiableCustomer = function (data){
    console.log("Dropped");
    console.log(data);
    if(_.findIndex($scope.loadOut.orders,{ 'id': data.id}) === -1 ){
      $scope.loadOut.orders.push(data);
    }else{
      $scope.showExistingAddressInRouteError(true,data.address_name);
    }
  };

  $scope.editAvailableCustomer = function (data,loadout_no, loadout_id,truck_id){
    console.log("Dropped");
    // console.log(data);
    // console.log(index);


    var newOrder = {
    "delivery_date": todayDayFormatted,
    "user": $scope.userName,
    "loadout_no": loadout_no,
    "loadout_id": loadout_id,
    "orders": data,
    "truck_id": truck_id,
    "flag": "edit"
    };

    console.log(newOrder);

    io.socket.request($scope.socketOptions('post','/load_out/add',{"Authorization": "Bearer " + authService.getToken()},newOrder), function (body, JWR) {
      console.log('Sails responded with post loadout: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.setEditLoadOut(-1);
        $scope.snackbarShow('Load Out Edited');
        $scope.$digest();
      }
    });  

  };

  $scope.addLoadOut = function (loadOut) {
    $scope.loadOut.user = $scope.userName;
    var addLoadOut = {
      "delivery_date": loadOut.delivery_date,
      "flag": loadOut.flag,
      "loadout_no": loadOut.loadout_no,
      "orders": loadOut.orders,
      "truck_id": loadOut.truck.id,
      "user": loadOut.user
    };
    console.log(addLoadOut);

     io.socket.request($scope.socketOptions('post','/load_out/add',{"Authorization": "Bearer " + authService.getToken()},addLoadOut), function (body, JWR) {
      console.log('Sails responded with post loadout: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.showAddLoadOutBox(false);
        $scope.snackbarShow('Load Out Added');
        $scope.$digest();
      }
    });  
    console.log(addLoadOut);
  };

  $scope.deleteOrderInLoadout = function (loadout_id,customerOrders_id) {
    console.log(loadout_id);
    console.log(customerOrders_id);
    var deliverInfo = {
      "delivery": customerOrders_id,
      "loadout": loadout_id
    };

    io.socket.request($scope.socketOptions('post','/delivery/remove',{"Authorization": "Bearer " + authService.getToken()},deliverInfo), function (body, JWR) {
      console.log('Sails responded with put address: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
         console.log("Deleted Address");
         $scope.$digest();
      }
    }); 
  };
  
  $scope.dropdownChange = function (loadout) {
    console.log(loadout.id);
    console.log(todayDayFormatted);
    $scope.loadOutNumbers = [1,2,3,4,5];
    // $scope.loadOut.loadout_no = $scope.loadOutNumbers[0];
    $http.get(httpHost + '/load_out?where={"truck_id":'+loadout.id+',"date_created":"'+todayDayFormatted+'"}').success( function (data) {
      // if(data.length !== 0){
        console.log(data);
        if(data.length !== 0){
          angular.forEach(data, function(loadout){
            console.log(loadout.loadout_number);
           var indexOfNumber = _.indexOf($scope.loadOutNumbers, loadout.loadout_number);
           $scope.loadOutNumbers.splice(indexOfNumber,1);
           $scope.loadOut.loadout_no = $scope.loadOutNumbers[0];
          });
           console.log($scope.loadOutNumbers);
        }
      // }else{
      //   $scope.noCustomerOrdersAvailable = true;
      // }
    }).error(function (err) {
      console.log(err);
    });
  };

  io.socket.on('loadout', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);

    switch (msg.verb) {
      case "created": 
        console.log("Load Created");
        $scope.loadOuts.push(msg.data);
        console.log($scope.loadOuts);
        if($scope.noLoadOut === true){
          $scope.noLoadOut = false;
        }
        $scope.$digest();
        break;
      case "updated": 
        console.log("Route Updated");
        var index = _.findIndex($scope.loadOuts,{'id': msg.data[0].id});
        console.log(index);
        $scope.loadOuts[index] = msg.data;   
        // console.log(msg.data);
        $scope.$digest();
    }

  });

}]);
