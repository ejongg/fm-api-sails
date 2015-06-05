'use strict';

angular.module('fmApp')
.controller('PurchasesCtrl',['$scope','_','$http','$filter','httpHost','authService', '$modal', function($scope, _, $http, $filter,httpHost,authService, $modal){
  $scope.purchasesList = [];
  $scope.skuList = [];
  $scope.bays = [];
  $scope.purchases = [];
  $scope.purchaseProducts = [];

  $scope.purchase = {};
  $scope.purchase.prod_date = new Date();

  $scope.totalAmount= 0;

  $scope.noBays = true;
  $scope.noSKU = false;
  $scope.noPurchase = false;
  

  $scope.itemExistingError = false;
  $scope.itemExisting = '';
  $scope.addPurchaseForm = false;
  $scope.viewProducts = false;

  $scope.errorMessage = '';
  $scope.hasError = false;
  $scope.companies = ['Coca-Cola', 'SMB'];


  // forSorting
  $scope.sortCriteria = 'id';
  $scope.reverseSort = false;

  $scope.maxBottle = 12;

  
  
  var getSKU = function () {
    $http.get(httpHost + '/sku').success( function (data) {
      
      if(data.length !== 0){
        $scope.skuList = $scope.sortData(data,'prod_id.brand_name');
        $scope.purchase.sku = null;
        console.log("SKU List:");
        console.log($scope.skuList);
      }else{
        $scope.noSKU = true;
      }

    }).error(function (err) {
      $scope.checkError(err);
    });

  };

  $scope.getBays = function (sku){
    console.log(sku.id);
    console.log("Get Bays");
     $http.get(httpHost + '/bays/list/sku-lines?id=' + sku.id).success( function (data) {
      console.log(data);
      if(data.length !== 0){
      $scope.bays = data;
      $scope.purchase.bay = $scope.bays[0];        
      console.log("Bays:");
      console.log($scope.bays);
        $scope.noBays =false;
      }else{
        $scope.noBays = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  $scope.changeCompany = function () {
    console.log("Company Changed");
    $scope.purchase.sku = null;
  };

  var getPurchases = function (){
    $http.get(httpHost + '/purchases').success( function (data) {
      if(data.length !== 0){
      $scope.purchasesList = data;
      console.log("Purchases:");
      console.log($scope.purchasesList);
        $scope.noPurchase = false;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  }
  
  getPurchases();
  getSKU();

  $scope.pagePrint = function () {
    window.print();
  };


  $scope.showErrorMessage = function (data,msg) {
       $scope.hasError = data;
       console.log($scope.hasError);
      if(data === true){
         console.log(data);
         console.log(msg);
         $scope.errorMessage = msg;
         clearForm();
      }
    }



  $scope.showAddPurchaseForm = function (data) {
    if($scope.viewProducts === true){
      $scope.showViewProducts(false);
      
    }
    $scope.purchaseForm.$setPristine();
    $scope.hasError = false;
    $scope.addPurchaseForm = data;

    if(data === false){
      clearForm();
      $scope.purchases = [];
      $scope.totalAmount = 0;
    }

    if($scope.itemExistingError === true){
      $scope.showItemExistingError(false)
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
      $scope.itemExisting = sku + " in bay" + bay + " is already added.";
    }else{
      $scope.itemExisting= '';
    }

  }

  var clearForm = function () {
    $scope.purchaseForm.$setPristine();
    $scope.purchase.sku = null;
    $scope.purchase.bay = null;
    $scope.purchase.cases = null;
    $scope.purchase.return_empties_bottles = null;
    $scope.purchase.return_empties_cases = null;
    $scope.purchase.cost = null;
    $scope.purchase.discount = null;
    $scope.purchase.prod_date = new Date();
    $scope.companySelected = $scope.companies[0];
  };

  $scope.combine = function (sku){
    return sku.prod_id.brand_name + ' ' + sku.sku_name;
  };

  $scope.combineBay = function (bay){
    return bay.bay_name + ' ' + bay.bay_label;
  };

  $scope.getPurchaseProducts = function (id) {

   $http.get('http://localhost:1337/purchases/details?id='+ id).success(function(data){
     $scope.purchaseProducts = data;
     $scope.purchaseProducts.id = id;
     console.log($scope.purchaseProducts);
     $scope.showViewProducts(true);
   });
    
  };

  $scope.addPurchase = function (purchase) {
    if($scope.itemExistingError === true){
      $scope.showItemExistingError(false);
    }
  console.log(purchase.sku.pricepercase);

    var purchaseInfo = {
      "sku_id" : purchase.sku.id,
      "bay_id" : purchase.bay.id,
      "name" : purchase.sku.sku_name + " " + purchase.sku.size,
      "company" : purchase.sku.prod_id.company,
      "bay" : purchase.bay.bay_name,
      "prod_date" : $scope.formatDate(purchase.prod_date),
      "cases" : purchase.cases,
      "costpercase" : purchase.sku.pricepercase,
      "discountpercase" : purchase.discount,
      "amount" : (purchase.cases * (purchase.sku.pricepercase - purchase.discount)) - ((purchase.return_empties_bottles * purchase.sku.priceperempty) + (purchase.return_empties_cases * purchase.sku.bottlespercase * purchase.sku.priceperempty)),
      "return_empties_bottles": purchase.return_empties_bottles,
      "return_empties_cases" : purchase.return_empties_cases,
      "bottlespercase": purchase.sku.bottlespercase,
      "lifespan" : purchase.sku.lifespan
    };
    
    console.log(purchaseInfo);

    if( _.findIndex($scope.purchases,{ 'sku_id': purchaseInfo.sku_id, 
    'bay_id': purchaseInfo.bay_id, 'prod_date': purchaseInfo.prod_date}) === -1 ){
           $scope.purchases.push(purchaseInfo);
           $scope.totalAmount += purchaseInfo.amount;
           console.log($scope.totalAmount);
           console.log($scope.totalAmount);
    }else{
      var index = _.findIndex($scope.purchases,{ 'sku_id': purchaseInfo.sku_id, 
      'bay_id': purchaseInfo.bay_id, 'prod_date': purchaseInfo.prod_date});
      console.log(index);
      console.log(purchaseInfo.cases);
      $scope.purchases[index].cases += purchaseInfo.cases;
      $scope.purchases[index].costpercase += purchaseInfo.costpercase;
      $scope.purchases[index].discountpercase += purchaseInfo.discountpercase;
      $scope.purchases[index].amount += purchaseInfo.amount;
      $scope.totalAmount += purchaseInfo.amount;
      $scope.showItemExistingError(true,purchaseInfo.name,purchaseInfo.bay);
    }
    
    console.log("Purchases:");
    console.log($scope.purchases);

    clearForm();
  };

  $scope.deletePurchase = function (index) {
    $scope.totalAmount -= $scope.purchases[index].amount;
    $scope.purchases.splice(index,1);
  };

  $scope.submitPurchases = function () {
    var purchase = {
       "products" : $scope.purchases,
       "total_amount" : $scope.totalAmount,
       "user" : $scope.userName
    };

    console.log(purchase);
      
    io.socket.request($scope.socketOptions('post','/purchases/add',{"Authorization": "Bearer " + authService.getToken()},purchase), function (body, JWR) {
      console.log('Sails responded with post user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
        $scope.showAddPurchaseForm(false);
        $scope.snackbarShow('Purchase Added');
        $scope.totalAmount = 0;
        
      }else if (JWR.statusCode === 400){
        console.log("Error Occured");
        $scope.showErrorMessage(true,body);
      }

       $scope.$digest();
    
    }); 

  };

  io.socket.on('purchases', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);

    if(msg.verb === 'created'){
      console.log("Purchase Created");
      $scope.purchasesList.push(msg.data);
      if($scope.noPurchase === true){
          $scope.noPurchase = false;
      }
      $scope.$digest();
    }

  });

  io.socket.on('sku', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);
    
    switch (msg.verb) {
      case "created": 
        console.log("SKU Created");
        $scope.skuList.push(msg.data);
        $scope.skuList = $scope.sortData($scope.skuList,'prod_id.brand_name');
        if($scope.noSKU === true){
          $scope.noSKU = false;
        }
        $scope.purchase.sku = null;
        $scope.$digest();
        break;
      case "updated":
        console.log("SKU Updated");
        var index = _.findIndex($scope.skuList,{'id': msg.data.id});
        $scope.skuList[index] = msg.data;
        $scope.skuList = $scope.sortData($scope.skuList,'prod_id.brand_name');
        $scope.purchase.sku = null;
        $scope.$digest();
        break;
      case "destroyed":
        console.log("SKU Deleted");
        var index = _.findIndex($scope.skuList,{'id': msg.data[0].sku_id});
        $scope.skuList.splice(index,1);
        $scope.skuList = $scope.sortData($scope.skuList,'prod_id.brand_name');
        if($scope.skuList.length === 0){
          $scope.noSKU = true;
          if($scope.addPurchaseForm === true){
            console.log("Close form");
            $scope.addPurchaseForm = false;
          }
        }else{
          $scope.purchase.sku = null;
        }
        $scope.$digest();
    }
  });

  io.socket.on('bays', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);
    
    switch (msg.verb) {
      case "created": 
        console.log("Bay Created");
        $scope.bays.push(msg.data);
        $scope.bays = $scope.sortData($scope.bays,'bay_name');
        if($scope.noBays === true){
          $scope.noBays = false;
        }
        $scope.purchase.bay = null;
        $scope.$digest();
        break;
      case "updated":
        console.log("Bay Updated");
        var index = _.findIndex($scope.bays,{'id': msg.data.id});
        $scope.bays[index] = msg.data;
        $scope.bays = $scope.sortData($scope.bays,'bay_name');
        $scope.purchase.bay = null;
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Bay Deleted");
        var index = _.findIndex($scope.bays,{'id': msg.data[0].bay_id});
        $scope.bays.splice(index,1);
        $scope.bays = $scope.sortData($scope.bays,'bay_name');
        if($scope.bays.length === 0){
          $scope.noBays = true;
          if($scope.addPurchaseForm === true){
            console.log("Close form");
            $scope.addPurchaseForm = false;
          }
        }else{
          $scope.purchase.bay = null;
        }
        $scope.$digest();

    }

  });
        


  $scope.open = function (bay) {
    console.log("Open Modal");

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'purchaseDetailsModal.html',
      controller: 'BayModalCtrl',
      resolve: {
        bay: function () {
          return bay;
        }
      }
    });

    modalInstance.result.then(function (bay) {
      $scope.deleteBay(bay);
    }, function () {
      console.log("close");
    });

  };

}])

  .controller('BayModalCtrl', function ($scope, $modalInstance, bay) {

  $scope.ok = function () {
    $modalInstance.close(bay);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});



