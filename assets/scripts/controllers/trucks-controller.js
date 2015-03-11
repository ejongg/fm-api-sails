'use strict';

angular.module('fmApp')
.controller('TrucksCtrl',['$scope','$sailsSocket','_','$http', function($scope, $sailsSocket, _, $http){
  $scope.trucks = [];
  $scope.editIndex = [];
  $scope.truck = {};
  $scope.truckEdit = {};

  $scope.addTruckForm = false;

  var getTrucks = function () {
      io.socket.get('/trucks');
      $http.get('http://localhost:1337/trucks').success(function (data) {
      $scope.trucks = data;
      console.log("Trucks");
      console.log($scope.trucks);
      }).error(function (err) {
      console.log("Trucks Error");
      console.log(err);
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
      console.log("Add Truck");
      console.log(truck);
      io.socket.post('http://localhost:1337/trucks', truck);
  }; 

  $scope.editTruck = function (newInfo) {
      console.log("Edit Truck");
      console.log(newInfo);
      io.socket.put('/trucks/' + newInfo.id, newInfo);
      $scope.truckEditClicked(-1);
  };

  $scope.deleteTruck = function (truckId) {
      io.socket.delete('/trucks/' + truckId);
  };

   io.socket.on('trucks', function(msg){
            switch (msg.verb){
                case 'created' :
                     console.log("Truck Created");
                    $scope.trucks.push(msg.data);
                    $scope.$digest();
                    break;
                    
                case 'updated' :
                    console.log("Truck Updated");
                    var updated = msg.data;
                    var index = _.findIndex($scope.trucks, {id : updated.id});
                    
                    $scope.trucks[index] = msg.data; 
                    $scope.$digest();
                    break;
                case 'destroyed' : 
                    console.log("Truck Destroyed");
                    console.log(msg);
                    var deleted = msg.data;
                    var index = _.findIndex($scope.trucks, {id : deleted.id});
                    $scope.trucks.splice(index,1);
                    $scope.$digest();
            }
        });

}]);
