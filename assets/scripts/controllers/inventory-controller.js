'use strict';

angular.module('fmApp')
.controller('InventoryCtrl',['$scope','$http','$filter','httpHost', 'authService', function($scope, $http, $filter, httpHost, authService){
  $scope.inventory = [];
  $scope.sku = [];
  $scope.bays = [];

  var getInventory = function () {
    // io.socket.request($scope.socketOptions('get','/inventory'), function (body, JWR) {
    //   console.log('Sails responded with get inventory: ', body);
    //   console.log('and with status code: ', JWR.statusCode);
    //   if(JWR.statusCode === 200){
    //     $scope.inventory = body;
    //     $scope.$digest();
    //   }
    // });
    $http.get(httpHost + '/inventory/getInventory').success( function (data) {
      if(data.length !== 0){
        $scope.inventory = data;

        console.log("Inventory:");
        console.log($scope.inventory);
      }
    }).error(function (err) {
      console.log(err);
    });
  };

  getInventory();

  

}]);
