'use strict';

angular.module('fmApp')
.controller('ExpensesCtrl',['$scope','_','$http', 'httpHost', 'authService', function($scope, _, $http, httpHost, authService){
  $scope.expenseType = ['Utilities','Breakage', 'Spoilage'];
  $scope.skuList = [];

  $scope.expense = {};
  $scope.expense.date = new Date();
  $scope.expense.products = {};

  $scope.expenseEdit = {};

  $scope.noSKU = false;

  $scope.addExpenseForm = false;
  $scope.addOtherMode = true;


  var getSKUAvailable = function () {
    $http.get(httpHost + '/sku/available').success( function (data) {
      if(data.length !== 0){
      $scope.skuList = data;
      $scope.expense.products.sku = $scope.skuList[0];
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
    }else{
      $scope.addOtherMode = true;
    }
  };

  $scope.showAddExpenseForm = function (data) {
    $scope.addExpenseForm = data;
    if(data === false){
      console.log("Close");
      $scope.expense = {};
      $scope.expense.type = $scope.expenseType[0];
      $scope.expense.date = new Date();
      $scope.expense.products = {};
      $scope.expense.products.sku = $scope.skuList[0];
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

  $scope.addExpense = function (expense) {
    console.log(expense);
  };

  $scope.editExpense = function (expense) {
    console.log(expense);
  };

}]);
