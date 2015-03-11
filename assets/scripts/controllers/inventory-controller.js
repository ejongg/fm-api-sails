'use strict';

angular.module('fmApp')
.controller('InventoryCtrl',['$scope','$http','$sailsSocket','$filter', function($scope, $http, $sailsSocket, $filter){
	$scope.bays = [];
	$scope.skuLists = [];
  $scope.inventory = [];

	$scope.item = {};
  $scope.itemEdit = {};
  $scope.itemDelete = {};
  $scope.copiedItem = {};

  $scope.itemEdit.exp_date = new Date();
  $scope.item.exp_date = new Date();

	$scope.addItemForm = false;
  $scope.editOrDeleteItemForm = false;
  $scope.editItemTab = true;

  var getBays = function () {
    $http.get('http://localhost:1337/bays').success(function(data){
      $scope.bays = data;
       $scope.item.bay_id = $scope.bays[0].id;
    }).error(function (err) {
      console.log(err);
    });
  };
  
  var getSKU = function () {
    $http.get('http://localhost:1337/sku').success(function(data){
      $scope.skuLists = data;
      $scope.item.sku_id = $scope.skuLists[0].id;
    }).error(function (err) {
      console.log(err);
    });
  };

  var getInventory = function () {
    $http.get('http://localhost:1337/inventory').success(function(data){
      $scope.inventory = data;
      console.log($scope.inventory);
    }).error(function (err) {
      console.log(err);
    });
  };
  
  getInventory();
  getBays();
  getSKU();

  $scope.showAddItemForm = function (data) {
      $scope.addItemForm = data;
      if($scope.editOrDeleteItemForm === true) {
        $scope.showEditOrDeleteItemForm(false);
      }
      if(data === false){
        clearForm();
      }
  };

  $scope.showEditOrDeleteItemForm = function (data) {
      $scope.editOrDeleteItemForm = data;
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

  $scope.itemClicked = function (item) {
    console.log("Item Clicked");
    if($scope.addItemForm  === true){
      $scope.showAddItemForm(false);
    }
  
    $scope.copiedItem = angular.copy(item);
    console.log($scope.copiedItem);
    $scope.itemEdit.id = $scope.copiedItem.id;
    $scope.itemEdit.bay_id = $scope.copiedItem.bay_id.id;
    $scope.itemEdit.sku_id = $scope.copiedItem.sku_id.id;
    $scope.itemEdit.exp_date = $scope.copiedItem.exp_date;
    $scope.itemEdit.cases = $scope.copiedItem.cases;


    // $scope.customerDelete.id = $scope.copiedCustomer.id;
    // $scope.customerDelete.establishment_name = $scope.copiedCustomer.establishment_name;
    // $scope.customerDelete.owner_name = $scope.copiedCustomer.owner_name;
    // $scope.customerDelete.address = $scope.copiedCustomer.address;
    // $scope.customerDelete.distance_rating = $scope.copiedCustomer.distance_rating;

    $scope.showEditOrDeleteItemForm(true);
 
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
      $sailsSocket.post('/inventory/add', {"item" : itemInfo}).error(function (err) {
      console.log(err);
      console.log("Error");
      });
  };

  $scope.editInventory = function (item) {
    console.log(item);
  };

  $sailsSocket.subscribe('inventory', function(msg){
      switch (msg.verb){
        case 'created' :
           $scope.inventory.push(msg.data);
           $scope.showAddItemForm(false);
           clearForm();
          break;
                    
        // case 'updated' : 
        //   var index = _.findIndex($scope.inventory, {id : $scope.item_id});
        //  $scope.inventory[index] = msg.data;
        //   $scope.$digest();
                    
      }
  });

}]);
