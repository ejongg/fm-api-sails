'use strict';

angular.module('fmApp')
.controller('DSSRCtrl',['$scope','_','$http', 'httpHost', 'authService', function($scope, _, $http, httpHost, authService){
	
  $scope.beginning_inventory = 0;
  $scope.ending_inventory = 0;
  $scope.purchases = 0;
  $scope.expenses = 0;
  $scope.empties = 0;
  $scope.income = 0;
  $scope.stt = 0;
  $scope.startDate = new Date();
  $scope.endDate = new Date();
  $scope.start = $scope.formatDate($scope.startDate);
  $scope.end = $scope.formatDate($scope.endDate);

  $scope.labels = ['Purchases', 'Expenses', 'Empties', 'Income', 'Sales to Trade'];
  $scope.series = ['DSSR'];

  $scope.dssrGet = function () {
    getDSSR();
  };

 
 
  var getDSSR = function () {
    $http.get(httpHost + '/reports/dssr?start='+$scope.start+'&'+'end='+$scope.end).success( function (data) {
      console.log("START DATE");
      console.log($scope.formatDate($scope.startDate));
      console.log($scope.formatDate($scope.endDate));
      $scope.beginning_inventory = data.beginning_inventory;
      $scope.ending_inventory = data.ending_inventory;
      $scope.purchases = data.purchases;
      $scope.expenses = data.expenses ;
      $scope.empties = data.empties;
      $scope.stt = data.stt;
      $scope.income = data.income;

       $scope.data = [
    [$scope.purchases, $scope.expenses, $scope.empties, $scope.income, $scope.stt]
  ];

      console.log(data);
    }).error(function (err) {
      console.log(err);
    });
  };


  getDSSR();

}]);
