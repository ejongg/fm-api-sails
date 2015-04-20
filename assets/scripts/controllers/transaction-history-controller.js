'use strict';

angular.module('fmApp')
.controller('TransactionHistoryCtrl',['$scope', '_', '$http', 'httpHost','authService','userService','$filter', function($scope, _, $http, httpHost, authService,userService,$filter){
	
  $scope.transactions = [];

  var getTransactions= function () {
    $http.get(httpHost + '/reports/transactions').success( function (data) {
      $scope.transactions = $filter('transactionFilter')(data);
      console.log("Transactions:");
      console.log($scope.transactions);
    }).error(function (err) {
      console.log(err);
    });
  };

  getTransactions();

}]);
