'use strict';

angular.module('fmApp')
.controller('InventoryCtrl',['$scope','$http','$sailsSocket','$filter', function($scope, $http, $sailsSocket, $filter){
	$scope.bays = [];
	$scope.skuLists = [];
  $scope.inventory = [];

	$scope.item = {};
  $scope.item.exp_date = new Date();

	$scope.addItemForm = false;

  var getBays = function () {
    $sailsSocket.get('http://localhost:1337/bays').success(function(data){
      $scope.bays = data;
       $scope.item.bay_id = $scope.bays[0].id;
    }).error(function (err) {
      console.log(err);
    });
  };
  
  var getSKU = function () {
    $sailsSocket.get('http://localhost:1337/sku').success(function(data){
      $scope.skuLists = data;
      $scope.item.sku_id = $scope.skuLists[0].id;
    }).error(function (err) {
      console.log(err);
    });
  };

  var getInventory = function () {
    $sailsSocket.get('http://localhost:1337/inventory').success(function(data){
      $scope.inventory = data;
    }).error(function (err) {
      console.log(err);
    });
  };
  
  getInventory();
  getBays();
  getSKU();

  $scope.showAddItemForm = function (data) {
      $scope.addItemForm = data;
      if(data === false){
        clearForm();
      }
  };

  $scope.combined = function (sku) {
    return sku.sku_name + ' ' + sku.size;
  }

  var clearForm = function () {
    $scope.item.bay_id = $scope.bays[0].id;
    $scope.item.sku_id = $scope.skuLists[0].id;
    $scope.item.exp_date = '';
    $scope.item.cases = null;
  }; 

  $scope.addInventory = function (item) {
      var date = $filter('date')(item.exp_date, "yyyy-MM-dd HH:mm:ss");
      
      var itemInfo = {
        "bay_id": item.bay_id, 
        "sku_id": item.sku_id, 
        "exp_date": date, 
        "cases": item.cases
      };
      
      console.log(itemInfo);
      $sailsSocket.post('/inventory/add', {"item" : itemInfo}).success(function (data) {
      // console.log(data);
      // console.log("Added");
      // $scope.inventory.push(data);
      // $scope.showAddItemForm(false);
      // clearForm();
      }).error(function (err) {
      console.log(err);
      console.log("Error");
      });
  };

  $sailsSocket.subscribe('inventory', function(msg){
      switch (msg.verb){
        case 'created' :
           $scope.inventory.push(msg.data);
           $scope.showAddItemForm(false);
          break;
                    
        // case 'updated' : 
        //   var index = _.findIndex($scope.inventory, {id : $scope.item_id});
        //  $scope.inventory[index] = msg.data;
        //   $scope.$digest();
                    
      }
  });

}]);
