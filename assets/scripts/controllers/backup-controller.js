'use strict';

angular.module('fmApp')
.controller('BackupCtrl',['$scope','$http','$filter','httpHost', 'authService', function($scope, $http, $filter, httpHost, authService){
 
  $scope.sample = "Backup";

}]);
