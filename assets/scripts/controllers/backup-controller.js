'use strict';

angular.module('fmApp')
.controller('BackupCtrl',['$scope','$http','$filter','httpHost', 'authService','$modal', 
  function($scope, $http, $filter, httpHost, authService,$modal){
 
  $scope.backups = [];
  $scope.noBackup = false;


  var getBackup = function () {
    $http.get(httpHost + '/backup').success( function (data) {
      if(data.length !== 0){
        $scope.backups = data;
        console.log("Backups:");
        console.log($scope.backups);
      }else{
        $scope.noSKU = true;
         console.log("No Backup");
      }

    }).error(function (err) {
      $scope.checkError(err);
    });

  };

  getBackup();

  $scope.open = function (purchase) {
    console.log("Open Modal");
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'backupModal.html',
      controller: 'BackupModalCtrl'
    });

    modalInstance.result.then(function (voidInfo) {
    }, function () {
      console.log("close");
    });

  };

}])

  .controller('BackupModalCtrl',['$scope','$modalInstance','authService',
    function ($scope, $modalInstance,authService) {
    $scope.ok= function (user) {

      io.socket.request($scope.socketOptions('get','/backup/backup',{"Authorization": "Bearer " + authService.getToken()}), function (body, JWR) {
      console.log('Sails responded with post user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $modalInstance.close();
      }else if (JWR.statusCode === 400){
        console.log("Error Occured");
        $scope.hasError = true;
        $scope.errMsg = body;
      }
       $scope.$digest();
      });

    };

      $scope.socketOptions = function (method,url,headers,params) {
    return {
      method: method,
      url: url,
      headers: headers,
      params: params
    };
    };

    $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
    };


}]);
