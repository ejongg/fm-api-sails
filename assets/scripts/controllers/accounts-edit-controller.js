'use strict';

angular.module('fmApp')
.controller('AccountsEditCtrl',['$scope', '_', '$http', 'httpHost','authService','userService', function($scope, _, $http, httpHost, authService,userService){
  $scope.editForm = 0;
  $scope.user = {};
  $scope.userEdit = {};

  var getUser = function () {
    $http.get('http://localhost:1337/users/' + userService.getUser().id ).success(function(data){
      $scope.user = data;
      $scope.userEdit = angular.copy($scope.user);
        console.log("User:");
        console.log($scope.user);
    }).error(function (err) {
      console.log(err);
    });
  };

  getUser();

  $scope.showUsernameForm = function (data) {
    $scope.editForm = data;
    if (data === 0) {
      $scope.userEdit = angular.copy($scope.user);
    }
  };

  $scope.editUser = function (user) {
    console.log(user);
    io.socket.request($scope.socketOptions('put','/users/' + user.id,{"Authorization": "Bearer " + authService.getToken()} , user), function (body, JWR) {
      console.log('Sails responded with edit user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.showUsernameForm(0);
        $scope.$digest();
      }
    }); 
  };

  io.socket.on('users', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);
    
    if(msg.verb === "updated") {
      console.log("User Updated");
      $scope.user = msg.data;
      $scope.$digest();
    }

  });

}]);
