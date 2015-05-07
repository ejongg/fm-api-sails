'use strict';

angular.module('fmApp')
.controller('ExpensesCtrl',['$scope','_','$http', 'httpHost', 'authService', function($scope, _, $http, httpHost, authService){
  $scope.expenseType = ['Breakage', 'Spoilage', 'Utilities'];
  $scope.skuList = [];
  $scope.expense = {};
  $scope.expense.products= {};
  $scope.noSKU = false;


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

  $scope.combine = function (sku){
    return sku.prod_id.brand_name + ' ' + sku.sku_name;
  };

}]);
