'use strict';

angular.module('fmApp')
.controller('DSSRCtrl',['$scope','_','$http', 'httpHost', 'authService', function($scope, _, $http, httpHost, authService){
	
  $scope.beginning_inventory = 0;
  $scope.ending_inventory = 0;
  $scope.purchases = 0;
  $scope.deliveries = 0;
  $scope.expenses = 0;
  $scope.empties = 0;
  $scope.income = 0;


  var getDSSR = function () {
    $http.get(httpHost + '/reports/dssr').success( function (data) {
      $scope.beginning_inventory = data.beginning_inventory;
      $scope.ending_inventory = data.ending_inventory;
      $scope.purchases = data.purchases;
      $scope.deliveries = data.deliveries;
      $scope.expenses = data.expenses;
      $scope.empties = data.empties;
    }).error(function (err) {
      console.log(err);
    });
  };

  getDSSR();
}]);
