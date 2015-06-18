'use strict';

angular.module('fmApp')
.controller('EmptiesInventoryCtrl',['$scope','$http','$filter','httpHost', 'authService', function($scope, $http, $filter, httpHost, authService){
  $scope.emptiesInventory = [];
  $scope.sku = [];
  $scope.bays = [];

  $scope.noEmptiesInventory = false;

  $scope.sortCriteria='id';
  $scope.reverseSort = false;

  var getInventory = function () {
    // io.socket.request($scope.socketOptions('get','/inventory'), function (body, JWR) {
    //   console.log('Sails responded with get inventory: ', body);
    //   console.log('and with status code: ', JWR.statusCode);
    //   if(JWR.statusCode === 200){
    //     $scope.inventory = body;
    //     $scope.$digest();
    //   }
    // });
    $http.get(httpHost + '/empties/list').success( function (data) {
      if(data.length !== 0){
        $scope.emptiesInventory = data;

        console.log(" Empties Inventory:");
        console.log($scope.emptiesInventory);
      }else{
        $scope.noEmptiesInventory = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  getInventory();

   io.socket.on('empties', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);
    
    switch (msg.verb) {
      case "updated":
        console.log("Bay Updated");
        getInventory();
        $scope.$digest();
    }

  });

  $scope.pagePrint = function () {
    window.print();
  };

  

}]);
