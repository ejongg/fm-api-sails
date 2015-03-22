'use strict';

angular.module('fmApp')
.controller('AccountsCtrl',['$scope','_', function($scope, _){
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
    io.socket.request($scope.socketOptions('get','/users'), function (body, JWR) {
      console.log('Sails responded with get user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.users = body;
        $scope.$digest();
      }
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
    io.socket.request($scope.socketOptions('post','/users',{},user), function (body, JWR) {
      console.log('Sails responded with post user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
      
      }
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
    io.socket.request($scope.socketOptions('delete','/users/' + user.id,{}), function (body, JWR) {
      console.log('Sails responded with delete user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        
      }
    }); 
	};

  io.socket.on('users', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);

    switch (msg.verb) {
      case "created": 
        console.log("User Created");
        $scope.users.push(msg.data);
        $scope.showAddUserForm(false);
        clearForm()
        $scope.$digest();
        break;
      case "destroyed":
        console.log("User Deleted");
        console.log($scope.users);
        var index = _.findIndex($scope.users,{'id': msg.data.id});
        $scope.users.splice(index,1);
        $scope.showEditOrDeleteUserForm(false);
        $scope.$digest();
    }

  });


}]);
