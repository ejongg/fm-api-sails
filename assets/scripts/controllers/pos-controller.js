'use strict';

angular.module('fmApp')
.controller('POSCtrl',['$scope','_','$http','httpHost','authService', function($scope, _, $http, httpHost, authService){
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

  $scope.noSKU = true;


  $scope.totalAmount = 0;
  $scope.deposit = 0;

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
    $http.get(httpHost + '/sku/available').success( function (data) {
      if(data.length !== 0){
        $scope.skuList = data;
        $scope.transaction.sku = $scope.skuList[0];
        $scope.returns.sku = $scope.skuList[0];
        $scope.noSKU = false;

        console.log("Available SKU:");
        console.log($scope.skuList);
      }
    }).error(function (err) {
      console.log(err);
    });
  };

  getSKU();

  $scope.combined = function (sku) {
    return sku.sku_name + ' ' + sku.size;
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

  $scope.addTransactionItem = function (item) {
    if($scope.itemExistingTransactionError === true){
     $scope.showItemExistingTransactionError(false);
    }

    console.log(item);
    var itemInfo = {
      "sku_id" : item.sku.id,
      "sku_name" : item.sku.sku_name + " " + item.sku.size,
      "company" : item.sku.prod_id.company,
      "bottlespercase" : item.sku.bottlespercase,
      "bottles" : item.extraBottles,
      "cases" : item.cases,
      "amount" : (item.extraBottles * item.sku.priceperbottle) + (item.cases * item.sku.pricepercase)
    };

     console.log("Add Transaction Item");
     console.log(itemInfo);

     if( _.findIndex($scope.transactionItems,{ 'sku_id': itemInfo.sku_id }) === -1 ){
      $scope.transactionItems.push(itemInfo);
      $scope.totalAmount += itemInfo.amount ;
    }else{
      var index = _.findIndex($scope.transactionItems,{ 'sku_id': itemInfo.sku_id });
      $scope.transactionItems[index].bottles += itemInfo.bottles;
      $scope.transactionItems[index].cases += itemInfo.cases;
      $scope.showItemExistingTransactionError(true,itemInfo.sku_name);

    }
              
 };

  $scope.deleteTransactionItem= function (index) {
    $scope.totalAmount -= $scope.transactionItems[index].amount;
    $scope.transactionItems.splice(index,1);
  };

  $scope.addReturns = function (returns) {
    if($scope.itemExistingReturnsError === true){
     $scope.showItemExistingReturnsError(false);
    }

   var returnInfo = {
     "sku_id" : returns.sku.id,
     "sku_name" : returns.sku.sku_name + " " + returns.sku.size,
     "bottles" : returns.bottles,
     "cases" : returns.cases
   };

    if( _.findIndex($scope.returnsItems,{ 'sku_id': returnInfo.sku_id }) === -1 ){
      $scope.returnsItems.push(returnInfo);
    }else{
      var index = _.findIndex($scope.returnsItems,{ 'sku_id': returnInfo.sku_id });
      $scope.returnsItems[index].bottles += returnInfo.bottles;
      $scope.returnsItems[index].cases += returnInfo.cases;
      $scope.returnsItems[index].deposit += returnInfo.deposit;
      $scope.showItemExistingReturnsError(true,returnInfo.sku_name);
    }
            
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
      "deposit" : $scope.deposit,
      "user" : $scope.userName
    };
            
    // io.socket.post('/warehouse_transactions/add', transaction, function(response){
    //     if(response.code == 1){
    //         $scope.alert = "alert alert-success alert-dismissible";
    //     }else{
    //         $scope.alert = "alert alert-danger alert-dismissible";
    //     }
                
    //     $scope.message = response.message;
    //     $scope.show_alert = true;
    //     $scope.$digest();
    // });
    console.log(transaction);  
    io.socket.request($scope.socketOptions('post','/warehouse_transactions/add',{"Authorization": "Bearer " + authService.getToken()},transaction), function (body, JWR) {
      console.log('Sails responded with post bad order: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
        console.log("Success");
        $scope.$digest();
      }
    }); 

  };
}]);

