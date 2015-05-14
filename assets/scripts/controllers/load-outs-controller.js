'use strict';

angular.module('fmApp')
.controller('LoadOutsCtrl',['$scope', '_', '$http', 'httpHost','authService','userService','$filter', function($scope, _, $http, httpHost, authService,userService,$filter){
	
  $scope.loadOutNumbers = [1,2,3,4,5];
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

  $scope.ordersAvailableList = {};
  $scope.ordersAvailableListEdit = {};

  $scope.sortCriteria = '';
  
  var getCustomerOrdersAvailable = function () {
    $http.get(httpHost + '/customer-orders/list').success( function (data) {

      if(data.length !== 0){
         $scope.customerOrdersAvailable = $scope.sortData(data,'customer_id.establishment_name');
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

  getCustomerOrdersAvailable();
  getLoadOuts();
  getTrucks();

  $scope.pagePrint = function () {
    window.print();
  };
  
  $scope.setEditLoadOut = function (index) {
    if($scope.addLoadOutBox === true){
      $scope.showAddLoadOutBox(false);
    }
    $scope.editIndex = index;
  };

  $scope.showAddLoadOutBox = function (data){
    $scope.editIndex = -1;
    $scope.addLoadOutBox = data;
    if(data === true){
      if($scope.loadOut.truck){
        $scope.dropdownChange($scope.loadOut.truck);
      }
    }

    if(data === false){
      $scope.loadOut.loadout_no = $scope.loadOutNumbers[0];
      $scope.loadOutNumbers = [1,2,3,4,5];
      if($scope.noTrucks === false){
        $scope.loadOut.truck_id = $scope.trucks[0].id;
      }

      if($scope.loadOut.orders.length !== 0){
        for (var i = 0; i < $scope.loadOut.orders.length; i++) {
          $scope.customerOrdersAvailable.push($scope.loadOut.orders[i]);
        }
         $scope.loadOut.orders = [];
         $scope.customerOrdersAvailable = $scope.sortData($scope.customerOrdersAvailable,'customer_id.establishment_name');
         $scope.ordersAvailableList = $scope.customerOrdersAvailable[0];
         $scope.noCustomerOrdersAvailable = false;
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

  $scope.addAvailableCustomer = function (data,index){
    console.log("Dropped");
    console.log(data);
    $scope.loadOut.orders.push(data);

    console.log("Find Index");
    var index = _.findIndex($scope.customerOrdersAvailable,{'id': data.id});
    console.log(index);
    
    console.log("Splice");
    $scope.customerOrdersAvailable.splice(index,1);
    console.log($scope.customerOrdersAvailable.length);
    $scope.ordersAvailableList = $scope.customerOrdersAvailable[0];
    $scope.ordersAvailableListEdit = $scope.customerOrdersAvailable[0];

    if($scope.customerOrdersAvailable.length === 0){
      $scope.noCustomerOrdersAvailable = true;
    }
    // for (var i = 0; i <= $scope.loadOut.orders.length; i++) {
    //   if(_.findIndex($scope.loadOut.orders[i].order,{ 'id': data.id}) === -1 ){
    //     $scope.loadOut.orders.push(data);
    //   }else{
    //     $scope.showExistingAddressInRouteError(true,data.address_name);
    //   }
    // };

   
  };

  $scope.deleteAvailableCustomer = function (order) {
    console.log("Find Index");
    var index = _.findIndex($scope.loadOut.orders,{'id': order.id});
    console.log(index);

    console.log("Splice");
    $scope.loadOut.orders.splice(index,1);
    $scope.customerOrdersAvailable.push(order);
    $scope.customerOrdersAvailable = $scope.sortData($scope.customerOrdersAvailable,'customer_id.establishment_name');
    $scope.ordersAvailableList = $scope.customerOrdersAvailable[0];
    if($scope.noCustomerOrdersAvailable === true){
      $scope.noCustomerOrdersAvailable = false;
    }
  };

  $scope.editAvailableCustomer = function (data,loadout_no, loadout_id,truck_id){
    console.log("Dropped");
    // console.log(data);
    // console.log(index);
    
    console.log("Find Index");
    var index = _.findIndex($scope.customerOrdersAvailable,{'id': data.id});
    console.log(index);
    
    console.log("Splice");
    $scope.customerOrdersAvailable.splice(index,1);
    console.log($scope.customerOrdersAvailable.length);
    $scope.ordersAvailableList = $scope.customerOrdersAvailable[0];
    $scope.ordersAvailableListEdit = $scope.customerOrdersAvailable[0];

    if($scope.customerOrdersAvailable.length === 0){
      $scope.noCustomerOrdersAvailable = true;
    }

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
        $scope.snackbarShow('Load Out Edited');
        $scope.$digest();
      }
    });  

  };

  $scope.addLoadOut = function (loadOut) {
    console.log("loadout");
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

  $scope.deleteOrderInLoadout = function (loadout,customerOrders) {
    console.log(loadout);
    console.log(customerOrders);
    var deliverInfo = {
      "delivery": customerOrders.id,
      "loadout": loadout.id,
      "order": customerOrders
    };

    io.socket.request($scope.socketOptions('post','/delivery/remove',{"Authorization": "Bearer " + authService.getToken()},deliverInfo), function (body, JWR) {
      console.log('Sails responded with put address: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
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
        console.log("Load Updated");
        var index = _.findIndex($scope.loadOuts,{'id': msg.data.id});
        console.log(index);
        $scope.loadOuts[index] = msg.data;   
        $scope.$digest();
        break;
      case "destroyed": 
        console.log("Load Destroyed");
        if($scope.noCustomerOrdersAvailable === true){
          $scope.noCustomerOrdersAvailable =false;
        }

        var index = _.findIndex($scope.loadOuts,{'id': msg.data.loadout_id});
        console.log(index);
        // console.log($scope.loadOuts[index].transactions);
        var transIndex = _.findIndex($scope.loadOuts[index].transactions,{'id': msg.data.delivery_id});
        $scope.loadOuts[index].transactions.splice(transIndex,1);
        // var orderDeleted = _.pullAt($scope.loadOuts[index].transactions,transIndex);
        // console.log(orderDeleted[0]);
        $scope.customerOrdersAvailable.push(msg.data.order);
        console.log($scope.customerOrdersAvailable);

        $scope.ordersAvailableList = $scope.customerOrdersAvailable[0];
        $scope.ordersAvailableListEdit = $scope.customerOrdersAvailable[0];
        $scope.$digest();
    }

  });

}]);
