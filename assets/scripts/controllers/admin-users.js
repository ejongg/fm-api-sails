'use strict';

/**
 * @ngdoc function
 * @name itprojApp.controller:AdminUsersCtrl
 * @description
 * # AdminUsersCtrl
 * Controller of the itprojApp
 */
angular.module('itprojApp')
  .controller('AdminUsersCtrl', ['$scope', 'userService', function ($scope, userService) {
    $scope.username = userService.getUser().user;
    $scope.users = {};
    $scope.enableAdd = false;
    $scope.enableEdit = false;
    $scope.userTypes = ['admin','encoder','cashier','checker'];
    
    userService.getAllUsers('/fm-api/users').success(function (data) {
    $scope.users = data;
    });
    
    $scope.toggleAdd = function () {
      if ($scope.enableAdd === true) {
        $scope.enableAdd = false;
      }else{
        $scope.enableAdd = true;
      }
    };

    $scope.toggleEdit = function (user) {
      if ($scope.enableEdit === true) {
        $scope.enableEdit = false;
      }else{
        $scope.enableEdit = true;
      }

      $scope.editUser = user;

    };

    $scope.add = function (addedUser) {
      console.log(addedUser);
      userService.addUser('/fm-api/users/create',addedUser).success(function (data) {
      console.log(data);	
      $scope.users.push(data);
      $scope.addedUser = {};
      $scope.enableAdd = false;
      });
      
    };

    $scope.delete = function (deletedUser) {
      userService.deleteUser('/fm-api/users/delete/',deletedUser).success(function (data) {
      	console.log(data);
      $scope.users.splice($scope.users.indexOf(deletedUser),1);
      });
    
    };

    $scope.edit = function (editUser) {
      userService.editUser('/fm-api/users/edit',editUser).success(function (data) {
        console.log(data);
      });
    };

    $scope.cancel = function (form) {
      if(form === 'add') {
        $scope.enableAdd = false;
        $scope.addedUser = {};
      }else {
        $scope.enableEdit = false;
      }
    };

  }]);
