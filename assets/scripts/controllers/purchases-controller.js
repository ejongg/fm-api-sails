'use strict';

angular.module('fmApp')
.controller('PurchasesCtrl',['$scope','$sailsSocket','_','$http','$filter', function($scope, $sailsSocket, _, $http, $filter){
  $scope.purchasesList = [];
  $scope.skuList = [];
  $scope.bays = [];
  $scope.purchases = [];
  $scope.purchaseProducts = [];

  $scope.purchase = {};
  $scope.purchase.prod_date = new Date();

  $scope.totalCost = 0;


  $scope.itemExistingError = false;
  $scope.itemExisting = '';
  $scope.addPurchaseForm = false;
  $scope.viewProducts = false;
  
  
  var getSKU = function () {
    $http.get('http://localhost:1337/sku').success(function(data){
      $scope.skuList = data;
      $scope.purchase.sku = $scope.skuList[0];
    });
  };

  var getBays = function (){
    $http.get('http://localhost:1337/bays').success(function(data){
      $scope.bays = data;
      $scope.purchase.bay = $scope.bays[0];
    });
  }

  var getPurchases = function (){
    $http.get('http://localhost:1337/purchases').success(function(data){
      $scope.purchasesList = data;
    });
  }
  
  getPurchases();
  getSKU();
  getBays();

  $scope.showAddPurchaseForm = function (data) {
    if($scope.viewProducts === true){
      $scope.showViewProducts(false);
    }

    $scope.addPurchaseForm = data;
    
    if(data === false){
      clearForm();
      $scope.purchases = [];
    }
  };


  $scope.showViewProducts = function (data) {
    if($scope.addPurchaseForm === true){
      $scope.showAddPurchaseForm(false);
    }
    $scope.viewProducts = data;
  };

  $scope.showItemExistingError = function (data, sku, bay) {
    $scope.itemExistingError = data;

    if(data === true){
      $scope.itemExisting = sku + " in " + bay + " Bay is already added.";
    }else{
      $scope.itemExisting= '';
    }

  }

  $scope.combined = function (sku) {
    return sku.sku_name + ' ' + sku.size;
  }

  var clearForm = function () {
    $scope.purchase.sku = $scope.skuList[0];
    $scope.purchase.bay = $scope.bays[0];
    $scope.purchase.cases = null;
    $scope.purchase.cost = null;
    $scope.purchase.prod_date = new Date();
  };

   $scope.getPurchaseProducts = function (id) {
    console.log(id);
   $http.get('http://localhost:1337/purchase_products?where={"purchase_id" :'+ id +'}').success(function(data){
     $scope.purchaseProducts = data;
     console.log($scope.purchaseProducts);
     $scope.showViewProducts(true);
   });
  };

  $scope.addPurchase = function (purchase) {
    if($scope.itemExistingError === true){
      $scope.showItemExistingError(false);
    }

    var purchaseInfo = {
      "sku_id" : purchase.sku.id,
      "bay_id" : purchase.bay.id,
      "name" : purchase.sku.sku_name + " " + purchase.sku.size,
      "company" : purchase.sku.prod_id.company,
      "bay" : purchase.bay.pile_name,
      "prod_date" : $filter('date')(purchase.prod_date, "yyyy-MM-dd HH:mm:ss"),
      "cases" : purchase.cases,
      "cost" : purchase.cost
    };
    
    if( _.findIndex($scope.purchases,{ 'sku_id': purchase.sku.id, 'bay_id':purchase.bay.id }) === -1 ){
           $scope.purchases.push(purchaseInfo);
           $scope.totalCost += purchase.cost;
    }else{
      $scope.showItemExistingError(true,purchaseInfo.name,purchaseInfo.bay);
    }

    console.log($scope.purchases);

    clearForm();
  };

  $scope.deletePurchase = function (index) {
    $scope.totalCost -= $scope.purchases[index].cost;
    $scope.purchases.splice(index,1);
  };

  $scope.submitPurchases = function () {
    $scope.purchases = _.map($scope.purchases, function (purchase) { return _.omit(purchase, 'cost'); });
    var purchase = {
       products : $scope.purchases,
       total_cost : $scope.totalCost,
       user : 'Sonic'
    };
            
    io.socket.post('/purchases/add', {purchases : purchase});
    $scope.totalCost = 0;
    $scope.showAddPurchaseForm(false);

  };

  io.socket.on('purchases', function(msg){
  	console.log("purchase created");
    console.log(msg);
    if (msg.verb === 'created') {
      console.log(msg.data);
      $scope.purchasesList.push(msg.data);
      console.log($scope.purchasesList);
      $scope.$digest();
    }
  });
        


}]);

