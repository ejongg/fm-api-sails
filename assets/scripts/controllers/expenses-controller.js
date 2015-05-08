'use strict';

angular.module('fmApp')
.controller('ExpensesCtrl',['$scope','_','$http', 'httpHost', 'authService', function($scope, _, $http, httpHost, authService){
  $scope.expenseType = ['Utilities','Breakage', 'Spoilage'];
  $scope.skuList = [];

  $scope.expense = {};
  $scope.expense.date = new Date();
  $scope.expense.products = [];
  $scope.expense.total_amount = 0;

  $scope.expenseEdit = {};

  $scope.noSKU = false;

  $scope.addExpenseForm = false;
  $scope.addOtherMode = true;


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

  getSKUAvailable();

  $scope.typeChange = function (type) {
    console.log(type);
    if(type === 'Breakage' || type === 'Spoilage'){
      $scope.addOtherMode = false;
      $scope.expense.amount = null;
      $scope.expense.date = new Date();
    }else{
      $scope.addOtherMode = true;
      $scope.expense.sku = $scope.skuList[0];
      $scope.expense.cases = null;
      $scope.expense.bottles = null;
      $scope.expense.date = new Date();
    }

  };

  $scope.showAddExpenseForm = function (data) {
    $scope.addExpenseForm = data;
    if(data === false){
      console.log("Close");
      $scope.expense = {};
      $scope.expense.type = $scope.expenseType[0];
      $scope.expense.date = new Date();
      $scope.expense.products = [];
      $scope.expense.sku = $scope.skuList[0];
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

  $scope.addSKUToList = function (expense) {
    console.log(expense);
    var prod = {
      "bottles" : expense.bottles,
      "cases": expense.cases,
      "id": expense.sku.id,
      "bottlespercase": expense.sku.bottlespercase,
      "sku": $scope.combine(expense.sku)
    };

    if( _.findIndex($scope.expense.products,{ 'id': prod.id}) === -1 ){
           $scope.expense.products.push(prod);
           $scope.expense.total_amount += (prod.bottles * expense.sku.priceperbottle) + (prod.cases * expense.sku.pricepercase);
           console.log(expense);
           console.log($scope.expense.products);
           console.log($scope.expense.total_amount);
    }else{
      var index = _.findIndex($scope.expense.products,{ 'id': prod.id});
      console.log(index);
      $scope.expense.products[index].cases += prod.cases;
      $scope.expense.products[index].bottles += prod.bottles;
      $scope.expense.total_amount += (prod.bottles * expense.sku.priceperbottle) + (prod.cases * expense.sku.pricepercase);
      //$scope.showItemExistingError(true,purchaseInfo.name,purchaseInfo.bay);
    }

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
        $scope.showAddPurchaseForm(false);
        $scope.snackbarShow('Expense Added');
        $scope.expense.total_amount = 0;
        $scope.$digest();
      }
    }); 

  };

  $scope.editExpense = function (expense) {
    console.log(expense);
  };

}]);
