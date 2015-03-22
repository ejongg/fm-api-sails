'use strict';

angular.module('fmApp')
.controller('InventoryCtrl',['$scope','$http','$sailsSocket','$filter', function($scope, $http, $sailsSocket, $filter){
  $scope.inventory = [];
  $scope.sku = [];
  $scope.bays = [];

  var getInventory = function () {
    io.socket.request($scope.socketOptions('get','/inventory'), function (body, JWR) {
      console.log('Sails responded with get inventory: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.inventory = body;
        $scope.$digest();
      }
    });
  };

  getInventory();

  

}]);
