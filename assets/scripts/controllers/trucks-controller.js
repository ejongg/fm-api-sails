'use strict';

angular.module('fmApp')
.controller('TrucksCtrl',['$scope','_','$http', function($scope, _, $http){
  $scope.trucks = [];
  $scope.editIndex = -1;
  $scope.truck = {};
  $scope.truckEdit = {};

  $scope.addTruckForm = false;

  var getTrucks = function () {
      // io.socket.get('/trucks');
      // $http.get('http://localhost:1337/trucks').success(function (data) {
      // $scope.trucks = data;
      // console.log("Trucks");
      // console.log($scope.trucks);
      // }).error(function (err) {
      // console.log("Trucks Error");
      // console.log(err);
      // });

    io.socket.request($scope.socketOptions('get','/trucks'), function (body, JWR) {
      console.log('Sails responded with get trucks: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.trucks = body;
        $scope.$digest();
      }
    });
  };

  getTrucks();

  $scope.showAddTruckForm = function (data) {
      $scope.addTruckForm = data;
      if(data === false){
        clearForm();
      }
  };
  
  var clearForm = function () {
    $scope.truck = {};
  }; 

  $scope.truckEditClicked = function (index,truck) {
    if(index !== -1){
      $scope.truckEdit = angular.copy(truck);
      $scope.editIndex = index;
    }else{
      $scope.editIndex = {};
    }

  };

  $scope.addTruck = function (truck) {
      // console.log("Add Truck");
      // console.log(truck);
      // io.socket.post('http://localhost:1337/trucks', truck);
      io.socket.request($scope.socketOptions('post','/trucks',{},truck), function (body, JWR) {
      console.log('Sails responded with post truck: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
      
      }
    });  
  }; 

  $scope.editTruck = function (newInfo) {
      // console.log("Edit Truck");
      // console.log(newInfo);
      // io.socket.put('/trucks/' + newInfo.id, newInfo);
      // $scope.truckEditClicked(-1);
    io.socket.request($scope.socketOptions('put','/trucks/' + newInfo.id,{},newInfo), function (body, JWR) {
      console.log('Sails responded with edit truck: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        
      }
    });
  };

  $scope.deleteTruck = function (truckId) {
      // io.socket.delete('/trucks/' + truckId);
    io.socket.request($scope.socketOptions('delete','/trucks/' + truckId,{}), function (body, JWR) {
      console.log('Sails responded with delete user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        
      }
    }); 
  };

   // io.socket.on('trucks', function(msg){
   //          switch (msg.verb){
   //              case 'created' :
   //                   console.log("Truck Created");
   //                  $scope.trucks.push(msg.data);
   //                  $scope.$digest();
   //                  break;
                    
   //              case 'updated' :
   //                  console.log("Truck Updated");
   //                  var updated = msg.data;
   //                  var index = _.findIndex($scope.trucks, {id : msg.data.id});
   //                  $scope.trucks[index] = msg.data; 
   //                  $scope.$digest();
   //                  break;
   //              case 'destroyed' : 
   //                  console.log("Truck Destroyed");
   //                  console.log(msg);
   //                  var deleted = msg.data;
   //                  var index = _.findIndex($scope.trucks, {id : deleted.id});
   //                  $scope.trucks.splice(index,1);
   //                  $scope.$digest();
   //          }
   //      });

  io.socket.on('trucks', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);

    switch (msg.verb) {
      case "created": 
        console.log("Truck Created");
        $scope.trucks.push(msg.data);
        $scope.showAddTruckForm(false);
        $scope.$digest();
        break;
      case "updated": 
        console.log("Truck Updated");
        var index = _.findIndex($scope.trucks, {id : msg.data.id});
        $scope.trucks[index] = msg.data;
        $scope.editIndex = -1; 
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Truck Deleted");
        var index = _.findIndex($scope.trucks, {id : msg.data.id});
        $scope.trucks.splice(index,1);
        $scope.editIndex = -1;
        $scope.$digest();
    }

  });

}]);
