'use strict';

angular.module('fmApp')
.controller('AccountsCtrl',['$scope', '_', '$http', 'httpHost','authService', function($scope, _, $http, httpHost, authService){
	$scope.types = ['admin','encoder','checker','cashier'];
	$scope.users = [];

	$scope.user = {};
  $scope.userEdit = {};
  $scope.userDelete = {};
  $scope.copiedUser = {};

  $scope.employees = [];
  $scope.noEmployees = false;

	$scope.addUserForm = false;
	$scope.editOrDeleteUserForm = false;
	// $scope.editUserTab = true;

  //for Sorting
  $scope.sortCriteria = "";

	var getUsers = function () {
    $http.get(httpHost + '/users').success( function (data) {
      $scope.users = data;
        console.log("Users:");
        console.log($scope.users);
    }).error(function (err) {
      console.log(err);
    });
	};

    var getEmployees = function () {
    $http.get(httpHost + '/employees').success( function (data) {
      if(data.length !== 0){
        $scope.employees = data;
        $scope.noEmployees = false;
        $scope.user.fullname = $scope.employees[0];

        console.log("Employees:");
        console.log($scope.employees);
      }
    }).error(function (err) {
      console.log(err);
    });
  };

  getEmployees();
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

    
    $scope.userClicked = function (user) {
      if($scope.addUserForm === true){
        $scope.showAddUserForm(false);
      }
      $scope.copiedUser = angular.copy(user);
      $scope.userDelete.id = $scope.copiedUser.id;
      $scope.userDelete.username = $scope.copiedUser.username;
      $scope.userDelete.password = $scope.copiedUser.password;
      $scope.userDelete.firstname = $scope.copiedUser.firstname;
      $scope.userDelete.lastname = $scope.copiedUser.lastname;
      $scope.userDelete.type = $scope.copiedUser.type;

      $scope.showEditOrDeleteUserForm(true);
    };

    var clearForm = function () {
      $scope.userForm.$setPristine();
      $scope.user.username = '';
      $scope.user.firstname = '';
      $scope.user.lastname = '';
      $scope.user.password = '';
      $scope.user.type= $scope.types[0];
    }; 

  $scope.fullName = function (emp) {
    return emp.emp_fname + ' ' + emp.emp_lname;
  };

	$scope.addUser = function (user) {
    
    var newUser = {
      "username" : user.username,
      "password" : user.password,
      "type" : user.type,
      "firstname" : user.fullname.emp_fname,
      "lastname" : user.fullname.emp_lname
    }

    io.socket.request($scope.socketOptions('post','/users',{"Authorization": "Bearer " + authService.getToken()},newUser), function (body, JWR) {
      console.log('Sails responded with post user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
          $scope.showAddUserForm(false);
          $scope.$digest();
      }
    });   
	}; 

	$scope.deleteUser = function (user) {
    io.socket.request($scope.socketOptions('delete','/users/' + user.id,{"Authorization": "Bearer " + authService.getToken()}), function (body, JWR) {
      console.log('Sails responded with delete user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.showEditOrDeleteUserForm(false);
        $scope.$digest();
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
        $scope.$digest();
        break;
      case "destroyed":
        console.log("User Deleted");
        console.log($scope.users);
        console.log(msg.data[0]);
        var index = _.findIndex($scope.users,{'id': msg.data[0].user_id});
        console.log(index);
        $scope.users.splice(index,1);
        $scope.$digest();
    }

  });


}]);
