'use strict';

angular.module('fmApp')
.controller('AccountsCtrl',['$scope','$sailsSocket','_', function($scope, $sailsSocket, _){
	$scope.types = ['admin','encoder','checker','cashier'];
	$scope.users = [];

	$scope.user = {};
  $scope.userEdit = {};
  $scope.userDelete = {};
  $scope.copiedUser = {};

	$scope.addUserForm = false;
	$scope.editOrDeleteUserForm = false;
	$scope.editUserTab = true;

	var getUsers = function () {
      $sailsSocket.get('/users').success(function (data) {
      $scope.users = data;
      }).error(function (err) {
      console.log(err);
      });
	};

    getUsers();

	$scope.showAddUserForm = function (data) {
      $scope.addUserForm = data;
      if($scope.editOrDeleteUserForm === true) {
        $scope.showEditOrDeleteUserForm(false);
      }
      if(data === false){
        clearForm();
      }
	};

	$scope.showEditOrDeleteUserForm = function (data) {
      $scope.editOrDeleteUserForm = data;
	};

	$scope.setEditUserTab = function (data) {
      $scope.editUserTab = data;
      if(data === true){
        $scope.userEdit.username = $scope.copiedUser.username;
        $scope.userEdit.password = $scope.copiedUser.password;
        $scope.userEdit.firstname = $scope.copiedUser.firstname;
        $scope.userEdit.lastname = $scope.copiedUser.lastname;
        $scope.userEdit.type = $scope.copiedUser.type;
      } 
	};
    
    $scope.userClicked = function (user) {
      if($scope.addUserForm === true){
        $scope.showAddUserForm(false);
      }
      $scope.copiedUser = angular.copy(user);
      $scope.userEdit.id = $scope.copiedUser.id;
      $scope.userEdit.username = $scope.copiedUser.username;
      $scope.userEdit.password = $scope.copiedUser.password;
      $scope.userEdit.firstname = $scope.copiedUser.firstname;
      $scope.userEdit.lastname = $scope.copiedUser.lastname;
      $scope.userEdit.type = $scope.copiedUser.type;
      
      $scope.userDelete.id = $scope.copiedUser.id;
      $scope.userDelete.username = $scope.copiedUser.username;
      $scope.userDelete.password = $scope.copiedUser.password;
      $scope.userDelete.firstname = $scope.copiedUser.firstname;
      $scope.userDelete.lastname = $scope.copiedUser.lastname;
      $scope.userDelete.type = $scope.copiedUser.type;

      $scope.showEditOrDeleteUserForm(true);
    };

    var clearForm = function () {
      $scope.user.username = '';
      $scope.user.firstname = '';
      $scope.user.lastname = '';
      $scope.user.password = '';
      $scope.user.type= $scope.types[0];
    }; 

	$scope.addUser = function (user) {
      console.log(user);
      $sailsSocket.post('/users', user).success(function (data) {
      console.log(data);
      $scope.users.push(data);
      $scope.showAddUserForm(false);
      clearForm();
      }).error(function (err) {
      console.log(err);
      });
	}; 

	$scope.editUser = function (newInfo) {
      console.log(newInfo);
      $sailsSocket.put('/users/' + newInfo.id, newInfo).success(function (data) {
        var index = _.findIndex($scope.users, function(user) { return user.id == data.id; });
        $scope.users[index] = data;
        $scope.showEditOrDeleteUserForm(false);
      }).error(function (err) {
        console.log(err);
      });
	};

	$scope.deleteUser = function (user) {
      $sailsSocket.delete('/users/' + user.id).success(function (data) {
        var index = _.findIndex($scope.users, function(user) { return user.id == data.id; });
        $scope.users.splice(index,1);
        $scope.showEditOrDeleteUserForm(false);
      }).error(function (err) {
        console.log(err);
      });
	};
}]);
