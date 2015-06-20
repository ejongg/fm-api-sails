'use strict';

angular.module('fmApp')
.controller('POSCtrl',['$scope','_','$http','httpHost','authService','$location', '$anchorScroll','$filter', function($scope, _, $http, httpHost, authService, $location,$anchorScroll,$filter){
  $scope.skuList = [];
  $scope.transaction = {};
  $scope.transactionItems = [];
  $scope.returns = {};
  $scope.returnsItems = [];
  $scope.customerName = '';

  $scope.itemExistingTransactionError = false;
  $scope.itemExistingTransaction = '';
  $scope.itemExistingReturnsError = false;
  $scope.itemExistingReturns = '';
  $scope.postResult = false;
  $scope.postResultMessage = '';

  $scope.noSKU = false;

  $scope.errorMessage = '';
  $scope.hasError = false;

  //$scope.maxBottles = 0;
  $scope.maxReturnedBottles = 0;

  $scope.maxDeposit =  0;

  $scope.totalAmount = 0;
  $scope.totalDeposit = 0;
  $scope.totalDiscount = 0;
  $scope.count = 0;
  $scope.casesMax = 0;

  $scope.inventory = [];
  $scope.invents = [];
  $scope.pricePerEmpt = 0;
  $scope.returnedValue = 0;
  //$scope.priceperempty = 0;

  //$scope.temp = [];

  var getSKU = function () {
    // io.socket.request($scope.socketOptions('get','/sku/available'), function (body, JWR) {
    //   console.log('Sails responded with get sku: ', body);
    //   console.log('and with status code: ', JWR.statusCode);
    //   if(JWR.statusCode === 200){
    //     $scope.skuList = body;
    //     $scope.transaction.sku = $scope.skuList[0];
    //     $scope.returns.sku = $scope.skuList[0];
    //     $scope.$digest();
    //   }
    // });
    $http.get(httpHost + '/sku/available-with-moving-pile').success( function (data) {
      if(data.length !== 0){
        $scope.skuList = data;
        // $scope.transaction.sku = $scope.skuList[0];
         $scope.transaction.sku = null;
        //$scope.maxBottles = $scope.transaction.sku.bottlespercase;
        //$scope.transaction.return_extraBottles = 0;
        //$scope.transaction.return_cases = 0;
        $scope.getMaxReturnedBottles($scope.transaction.sku);
        $scope.returns.sku = null;
        $scope.getSkuInventoryCount($scope.skuList[0]);
        
        console.log("Available SKU:");
        console.log($scope.skuList);
      }else{
        $scope.noSKU = true;
      }
    }).error(function (err) {
      console.log(err);
    });
  };

  var getInventory = function () {
    $http.get(httpHost + '/inventory/getInventory').success( function (data) {
      if(data.length !== 0){
        $scope.inventory = data;
        console.log("INVENTORY");
        console.log($scope.inventory);
        //$scope.smbInventory = $filter('filter')($scope.inventory, {company: 'SMB'});
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  getSKU();
  getInventory();
  

  $scope.getSkuInventoryCount = function (sku) {
    console.log("IN INVENTORY");
    console.log($scope.inventory);
    console.log("SKU SELECTED");
    console.log(sku);
    if(sku != null){
      var idSku = sku.id;
    }

    console.log("ID");
    console.log(idSku);

    $scope.invents = $filter('filter')($scope.inventory, {'sku_id': idSku},true);
    console.log("FILTERED");
    console.log($scope.invents);
    $scope.count = _.reduce(_.pluck($scope.invents,'physical_count'), function(total, n) {
      return total + n;
    });

    console.log("COUNT");
    console.log($scope.count);
  };

  $scope.getMaxReturnedBottles = function (returns){
    console.log("RETURNED:");
    if(returns != null){
       console.log(returns);
    $scope.maxReturnedBottles = returns.bottlespercase - 1;
    $scope.pricePerEmpt = returns.priceperempty;
    $scope.getMaxDeposit();
    console.log("MAX RETURNED BOTTLES " + $scope.maxReturnedBottles);
    }
  };

  $scope.getMaxDeposit = function () {
    $scope.maxDeposit = (($scope.transaction.extraBottles+($scope.transaction.cases * ($scope.maxReturnedBottles+1) ))*$scope.pricePerEmpt);
    $scope.returnedValue = (($scope.transaction.return_extraBottles+($scope.transaction.return_cases * ($scope.maxReturnedBottles+1) ))*$scope.pricePerEmpt);
    $scope.transaction.deposit = ($scope.maxDeposit - $scope.returnedValue);
    console.log("DEPOSIT MAX:");
    console.log($scope.maxDeposit);
    console.log("Returned Value");
    console.log($scope.returnedValue);

  };

  $scope.combined = function (sku) {
    return sku.prod_id.brand_name+ ' ' + sku.sku_name + ' ' + sku.size;
  }

  $scope.showErrorMessage = function (data,msg) {
     $scope.hasError = data;
     console.log($scope.hasError);
    if(data === true){
       console.log(data);
       console.log(msg);
       $scope.errorMessage = msg;
       clearForms();
    }
  }

  $scope.showItemExistingTransactionError = function (data, sku) {
    $scope.itemExistingTransactionError = data;
    var brand = $scope.transaction.sku.prod_id.brand_name;
    console.log("DEBUG");
    console.log(data);
    console.log(sku);
    if(data === true){
      $scope.itemExistingTransaction = brand + " "+sku + " is already added.";
    }else{
      $scope.itemExistingTransaction = '';
    }

  }

  $scope.showItemExistingReturnsError = function (data, sku) {
    $scope.itemExistingReturnsError = data;

    if(data === true){
      $scope.itemExistingReturns = sku + " is already added.";
    }else{
      $scope.itemExistingReturns = '';
    }

  }

  $scope.showPostResult = function (data, msg) {
    $scope.postResult = data;
    if (data === true) {
      $scope.postResultMessage = msg;
    }
  };

  var clearForms = function () {
    $scope.customerName = '';
    $scope.transaction.sku = $scope.skuList[0];
    $scope.transaction.extraBottles = null;
    $scope.transaction.cases = null;
    $scope.transaction.discount = null;
    $scope.transaction.return_extraBottles = null;
    $scope.transaction.return_cases = null;
    $scope.transaction.deposit = null;
    
    $scope.transactionItems = [];
    $scope.returnsItems = [];
    $scope.totalAmount = 0;
    $scope.totalDeposit = 0;
    $scope.totalDiscount = 0;

  };

  var clearTransactionForm = function () {
    $scope.transaction.sku = $scope.skuList[0];
    $scope.transactionForm.$setPristine();
    $scope.transaction.extraBottles = null;
    $scope.transaction.cases = null;
    $scope.transaction.discount = null;
    $scope.transaction.return_extraBottles = null;
    $scope.transaction.return_cases = null;
    $scope.transaction.deposit = null;
  };


  $scope.addTransactionItem = function (item) {
    if($scope.itemExistingTransactionError === true){
     $scope.showItemExistingTransactionError(false);
    }
    console.log("ITEM");
    console.log(item);
    var itemInfo = {
      "sku_id" : item.sku.id,
      "sku_name" : item.sku.sku_name + " " + item.sku.size,
      "company" : item.sku.prod_id.company,
      "brand_name": item.sku.prod_id.brand_name,
      "bottlespercase" : item.sku.bottlespercase,
      "bottles" : item.extraBottles,
      "cases" : item.cases,
      "discountpercase": item.discount,
      "amount" : (item.extraBottles * item.sku.priceperbottle) + (item.cases * item.sku.pricepercase),
      "pricepercase" : item.sku.pricepercase
    };

    var returnInfo = {
      "sku_id" : item.sku.id,
      "sku_name" : item.sku.sku_name + " " + item.sku.size,
      "brand_name" : item.sku.prod_id.brand_name,
      "bottles" : item.return_extraBottles,
      "cases" : item.return_cases,
      "bottlespercase" : item.sku.bottlespercase,
      "deposit": item.deposit,
      "priceperempty" :  item.sku.priceperempty
    };



     console.log("Add Transaction Item");
     console.log(itemInfo);
     console.log(returnInfo);
     //$scope.count = $scope.count - item.cases;
     console.log($scope.totalDeposit);

     if($scope.transaction.discount == null){
        $scope.transaction.discount = 0;
      }

     if( _.findIndex($scope.transactionItems,{ 'sku_id': itemInfo.sku_id }) === -1 ){
      $scope.transactionItems.push(itemInfo);
      $scope.returnsItems.push(returnInfo);
      $scope.totalAmount += itemInfo.amount ;
      $scope.totalDeposit += returnInfo.deposit;
      $scope.totalDiscount += (itemInfo.discountpercase * itemInfo.cases);

    }else{
      var index = _.findIndex($scope.transactionItems,{ 'sku_id': itemInfo.sku_id });
      $scope.transactionItems[index].bottles += itemInfo.bottles;
      $scope.transactionItems[index].cases += itemInfo.cases;
      $scope.transactionItems[index].amount += itemInfo.amount;
      $scope.returnsItems[index].bottles += returnInfo.bottles;
      $scope.returnsItems[index].cases += returnInfo.cases;
      $scope.returnsItems[index].deposit += returnInfo.deposit;
      $scope.totalDeposit += returnInfo.deposit;
      $scope.totalAmount += itemInfo.amount;
      $scope.totalDiscount += (itemInfo.discountpercase * itemInfo.cases);
      $scope.showItemExistingTransactionError(true,itemInfo.sku_name);
    }

     
     clearTransactionForm();
              
 };

  $scope.deleteTransactionItem= function (index) {
    //$scope.getSkuInventoryCount($scope.transaction.sku);
    $scope.totalDiscount = 0;
    $scope.totalDeposit -= $scope.returnsItems[index].deposit;
    $scope.totalAmount -= $scope.transactionItems[index].amount;
    $scope.transactionItems.splice(index,1);
    $scope.returnsItems.splice(index,1);
    console.log($scope.totalDeposit);
  };

  $scope.deleteReturnsItem= function (index) {
    $scope.returnsItems.splice(index,1);
  };

  $scope.finalizeTransaction = function(){
    var transaction = {
      "products" : $scope.transactionItems,
      "returns" : $scope.returnsItems,
      "customer_name" : $scope.customerName,
      "total_amount" : $scope.totalAmount,
      "deposit" : $scope.totalDeposit,
      "user" : $scope.userName
    };
            
    console.log(transaction);  
    io.socket.request($scope.socketOptions('post','/warehouse_transactions/add',{"Authorization": "Bearer " + authService.getToken()},transaction), function (body, JWR) {
      console.log('Sails responded with post bad order: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        clearForms();
        $scope.snackbarShow('Transaction Completed');
      }  else if (JWR.statusCode === 400){
        console.log("Error Occured");
        $scope.showErrorMessage(true,body.message);
      }

       $scope.$digest(); 
    }); 

  };
}]);

