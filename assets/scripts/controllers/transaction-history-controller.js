'use strict';

angular.module('fmApp')
.controller('TransactionHistoryCtrl',['$scope', '_', '$http', 'httpHost','authService','userService','$filter', function($scope, _, $http, httpHost, authService,userService,$filter){
	
  $scope.transactions = [];
  $scope.noTransactionHistory = true;

  var getTransactions= function () {
    $http.get(httpHost + '/reports/transactions').success( function (data) {
      if(data.length !== 0){
        $scope.transactions = $filter('transactionFilter')(data);
        console.log("Transactions:");
        console.log($scope.transactions);
        $scope.noTransactionHistory = false;
      }
    }).error(function (err) {
      console.log(err);
    });
  };

  getTransactions();

}]);
