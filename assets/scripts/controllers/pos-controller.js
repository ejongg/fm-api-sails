'use strict';

angular.module('fmApp')
.controller('POSCtrl',['$scope','_','$http','httpHost','authService','$location', '$anchorScroll', function($scope, _, $http, httpHost, authService, $location,$anchorScroll){
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

  $scope.maxBottles = 0;
  $scope.maxReturnedBottles = 0;

  $scope.maxDeposit =  0;

  $scope.totalAmount = 0;
  $scope.deposit = null;

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
        $scope.transaction.sku = $scope.skuList[0];
        $scope.maxBottles = $scope.transaction.sku.bottlespercase;
        $scope.maxReturnedsBottles = $scope.transaction.sku.bottlespercase;
        $scope.returns.sku = null;

        console.log("Available SKU:");
        console.log($scope.skuList);
      }else{
        $scope.noSKU = true;
      }
    }).error(function (err) {
      console.log(err);
    });
  };

  getSKU();

  $scope.getMaxBottles = function (sku){
    $scope.maxReturnedBottles = sku.bottlespercase;
    console.log("MAX BOTTLES " + $scope.maxBottles);
  };

  $scope.getMaxReturnedBottles = function (returns){
    console.log("RETURNED:");
    if(returns !== null){
       console.log(returns);
    $scope.maxReturnedBottles = returns.bottlespercase;
    console.log("MAX RETURNED BOTTLES " + $scope.maxReturnedBottles);
    }

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

    if(data === true){
      $scope.itemExistingTransaction = sku + " is already added.";
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
  };

  var clearTransactionForm = function () {
    $scope.transaction.sku = $scope.skuList[0];
    $scope.transaction.extraBottles = null;
    $scope.transaction.cases = null;
    $scope.transaction.discount = null;
    $scope.transaction.return_extraBottles = null;
    $scope.transaction.return_cases = null;
  };


  $scope.addTransactionItem = function (item) {
    if($scope.itemExistingTransactionError === true){
     $scope.showItemExistingTransactionError(false);
    }

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
      "amount" : (item.extraBottles * item.sku.priceperbottle) + (item.cases * item.sku.pricepercase)
    };

    var returnInfo = {
      "sku_id" : item.sku.id,
      "sku_name" : item.sku.sku_name + " " + item.sku.size,
      "brand_name" : item.sku.prod_id.brand_name,
      "bottles" : item.return_extraBottles,
      "cases" : item.return_cases,
      "bottlespercase" : item.sku.bottlespercase
    };

     console.log("Add Transaction Item");
     console.log(itemInfo);
     console.log(returnInfo);

     if( _.findIndex($scope.transactionItems,{ 'sku_id': itemInfo.sku_id }) === -1 ){
      $scope.transactionItems.push(itemInfo);
      $scope.returnsItems.push(returnInfo);
      $scope.totalAmount += itemInfo.amount ;
    }else{
      var index = _.findIndex($scope.transactionItems,{ 'sku_id': itemInfo.sku_id });
      $scope.transactionItems[index].bottles += itemInfo.bottles;
      $scope.transactionItems[index].cases += itemInfo.cases;
      $scope.returnsItems[index].bottles += returnInfo.return_extraBottles;
      $scope.returnsItems[index].cases += returnInfo.return_cases;
      $scope.showItemExistingTransactionError(true,itemInfo.sku_name);
    }

     clearTransactionForm();
              
 };

  $scope.deleteTransactionItem= function (index) {
    $scope.totalAmount -= $scope.transactionItems[index].amount;
    $scope.transactionItems.splice(index,1);
    $scope.returnsItems.splice(index,1);
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
      "deposit" : $scope.transaction.deposit,
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

