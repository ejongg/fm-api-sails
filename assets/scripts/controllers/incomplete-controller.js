'use strict';

angular.module('fmApp')
.controller('IncompleteCtrl',['$scope','_','$http', 'httpHost', 'authService', function($scope, _, $http, httpHost, authService){
  $scope.incompleteCases = [];

  $scope.noIncomplete = false;

  var getIncompleteCases = function () {

    $http.get(httpHost + '/incomplete_cases').success( function (data) {      
      if(data.length !== 0){
        $scope.incompleteCases = data;
        console.log('Incomplete Cases');
        console.log($scope.incompleteCases);
      }else{
         $scope.noIncomplete = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });

  };

  getIncompleteCases();
  
}]);
