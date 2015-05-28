'use strict';

angular.module('fmApp')
.controller('ExpensesCtrl',['$scope','_','$http', 'httpHost', 'authService', function($scope, _, $http, httpHost, authService){
  $scope.expenseType = ['Utilities','Breakage', 'Spoilage'];
  $scope.skuList = [];
  $scope.bays = [];
  $scope.expenses = [];

  $scope.expense = {};
  $scope.expense.date = new Date();
  $scope.expense.products = [];
  $scope.expense.total_amount = 0;

  $scope.expenseEdit = {};

  $scope.noSKU = false;
  $scope.noBays = false;
  $scope.noExpenses = false;

  $scope.addExpenseForm = false;
  $scope.addOtherMode = true;

  // forSorting
  $scope.sortCriteria='id';
  $scope.reverseSort = false;

  
  var getExpenses = function () {
    console.log("GET EXPENSES");
     $http.get(httpHost + '/expenses').success( function (data) {
      if(data.length !== 0){
      $scope.expenses = data;
      console.log("Expenses:");
      console.log($scope.expenses);
      }else{
        console.log("No expenses");
        $scope.noExpenses = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  }; 

  var getSKUAvailable = function () {
    $http.get(httpHost + '/sku/available').success( function (data) {
      if(data.length !== 0){
      $scope.skuList = data;
      $scope.expense.sku = $scope.skuList[0];
      console.log("SKU:");
      console.log($scope.skuList);
      }else{
        $scope.noSKU = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  var getBays = function () {
    $http.get(httpHost + '/bays/unempty').success( function (data) {
      if(data.length !== 0){
      $scope.bays = data;
      $scope.expense.bay = $scope.bays[0].id;
      console.log("Bays:");
      console.log($scope.bays);
      }else{
        $scope.noBays = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  getExpenses();
  getSKUAvailable();
  getBays();

  $scope.typeChange = function (type) {
    console.log(type);
    if(type === 'Breakage' || type === 'Spoilage'){
      $scope.addOtherMode = false;
      $scope.expense.amount = null;
      $scope.expense.date = new Date();
    }else{
      $scope.addOtherMode = true;
      $scope.expense.sku = $scope.skuList[0];
      $scope.expense.bay = $scope.bays[0].id;
      $scope.expense.cases = null;
      $scope.expense.bottles = null;
      $scope.expense.date = new Date();
      $scope.expense.total_amount = 0;
      $scope.expense.products = [];
    }

  };

  $scope.showAddExpenseForm = function (data) {
    $scope.addExpenseForm = data;
    if(data === false){
      console.log("Close");
      $scope.expense = {};
      $scope.expense.type = $scope.expenseType[0];
      $scope.expense.sku = $scope.skuList[0];
      $scope.expense.bay = $scope.bays[0].id;
      $scope.expense.cases = null;
      $scope.expense.bottles = null;
      $scope.expense.date = new Date();
      $scope.expense.total_amount = 0;
      $scope.expense.products = [];
      console.log("Add Other Moder");
      console.log($scope.addOtherMode);
      if($scope.addOtherMode === false){
         $scope.addOtherMode = true;
      }
      
    }
  };

  $scope.combine = function (sku){
    return sku.prod_id.brand_name + ' ' + sku.sku_name;
  };

  $scope.combineBay = function (bay){
    return bay.bay_name + ' ' + bay.bay_label;
  };

  $scope.addSKUToList = function (expense) {
    console.log(expense);
    var prod = {
      "bottles" : expense.bottles,
      "cases": expense.cases,
      "sku_id": expense.sku.id,
      "bottlespercase": expense.sku.bottlespercase,
      "sku": $scope.combine(expense.sku),
      "bay_id": expense.bay,
      "amount": (expense.bottles * expense.sku.priceperbottle) + (expense.cases * expense.sku.pricepercase)
    };

    console.log($scope.expense.products);
    console.log(prod);

    if( _.findIndex($scope.expense.products,{'sku_id': prod.sku_id}) === -1 ){
           $scope.expense.products.push(prod);
           $scope.expense.total_amount += prod.amount;
           console.log(expense);
           console.log($scope.expense.products);
           console.log($scope.expense.total_amount);
    }else{
      var index = _.findIndex($scope.expense.products,{'sku_id': prod.sku_id});
      console.log(index);
      $scope.expense.products[index].cases += prod.cases;
      $scope.expense.products[index].bottles += prod.bottles;
      $scope.expense.total_amount += prod.amount;
      //$scope.showItemExistingError(true,purchaseInfo.name,purchaseInfo.bay);
    }

    $scope.expense.sku = $scope.skuList[0];
    $scope.expense.bay = $scope.bays[0].id;
    $scope.expense.cases = null;
    $scope.expense.bottles = null;

  };

  $scope.deleteSKUToList = function (index){
    console.log($scope.expense.products[index].amount);
    $scope.expense.total_amount -= $scope.expense.products[index].amount;
    $scope.expense.products.splice(index,1);
  };

  $scope.addExpense = function (expense) {
    console.log(expense);
    var expenseInfo = {};
    if(expense.type === 'Breakage' || expense.type === 'Spoilage'){
      expenseInfo = {
      "type": expense.type,
      "amount": expense.total_amount,
      "date": $scope.formatDate(expense.date),
      "products": expense.products,
      "user" : $scope.userName
      };
    }else{
      expenseInfo = {
      "type": expense.type,
      "amount": expense.amount,
      "date": $scope.formatDate(expense.date),
      "user" : $scope.userName
      };
    }

    console.log(expenseInfo);
    

    io.socket.request($scope.socketOptions('post','/expenses/add',{"Authorization": "Bearer " + authService.getToken()},expenseInfo), function (body, JWR) {
      console.log('Sails responded with post user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
        $scope.showAddExpenseForm(false);
        $scope.snackbarShow('Expense Added');
        $scope.expense.total_amount = 0;
        $scope.$digest();
      }
    }); 

  };

  io.socket.on('expenses', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);

    if(msg.verb === 'created'){
      $scope.expenses.push(msg.data);
      if($scope.noExpenses === true){
        $scope.noExpenses = false;
      }
      $scope.$digest();
    }
    

  });


}]);
