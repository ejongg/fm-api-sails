'use strict';

angular.module('fmApp')
.controller('TransactionHistoryCtrl',['$scope', '_', '$http', 'httpHost','authService','userService','$filter', function($scope, _, $http, httpHost, authService,userService,$filter){
	
  $scope.transactions = [];
  $scope.noTransactionHistory = false;

  var getTransactions= function () {
    $http.get(httpHost + '/reports/transactions').success( function (data) {
      if(data.length !== 0){
        $scope.transactions = $filter('transactionFilter')(data);
        console.log("Transactions:");
        console.log($scope.transactions);
      }else{
        $scope.noTransactionHistory = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  getTransactions();

  $scope.pagePrint = function () {
    window.print();
  };

}]);
