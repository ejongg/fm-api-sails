'use strict';

angular.module('fmApp')
.controller('AccountsCtrl',['$scope', '_', '$http', 'httpHost','authService', '$modal', function($scope, _, $http, httpHost, authService, $modal){
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

  $scope.errorMessage = '';
  $scope.hasError = false;

  //for sorting
  $scope.sortCriteria='username';
  $scope.reverseSort = false;

  $scope.currentPage = 1;
  $scope.noOfRows = 0;
  $scope.newlyAdded = {};
  $scope.index = 0;

  $scope.resetId = null;

  $scope.showErrorMessage = function (data,msg) {
    $scope.hasError = data;
    console.log($scope.hasError);
    
    if(data === true){
      console.log(data);
      console.log(msg);
      $scope.errorMessage = msg;
      $scope.userForm.$setPristine();
      clearForm();
      
    }
  }


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
        $scope.employees =  $scope.sortData(data,'emp_fname');
         $scope.user.fullname = null;
        console.log("Employees:");
        console.log($scope.employees);
      }else{
        $scope.noEmployees = true;
      }
    }).error(function (err) {
      console.log(err);
    });
  };

  getEmployees();
  getUsers();

	$scope.showAddUserForm = function (data) {
      $scope.addUserForm = data;
      $scope.hasError = false;
      if($scope.editOrDeleteUserForm === true) {
        $scope.showEditOrDeleteUserForm(false);
      }
      if(data === false){
        clearForm();
      }
	};

	$scope.showEditOrDeleteUserForm = function (data) {
      $scope.editOrDeleteUserForm = data;
      if(data === false){
        $scope.resetId = null;
      }
	};

    
  $scope.userClicked = function (user) {
    $scope.resetId = user.id;
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

  var setPage = function(){

    console.log("NEWLY ADDED");
    $scope.newlyAdded;
    var username = $scope.newlyAdded.username;
    console.log("USERNAME");
    console.log(username);
    
    $scope.sortCriteria = 'username'
    $scope.filteredAndSortedData =  $scope.sortData($scope.users, 'username');
   
    console.log($scope.filteredAndSortedData);
    console.log("COMPANY :");

    console.log("NO OF ROWS");
    console.log($scope.noOfRows);
    $scope.index = (_.findIndex($scope.filteredAndSortedData,{'username' : username}))+1;
    if($scope.index < 1){
      $scope.currentPage =  1;
    }else{
      $scope.currentPage = Math.ceil($scope.index/$scope.noOfRows)
    }
    console.log("CURRENT PAGE: " + $scope.currentPage);
    console.log("INDEX: " + $scope.index);
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
          
      }else if (JWR.statusCode === 400){
        console.log("User already exist");
        $scope.showErrorMessage(true,"The username " + body.invalidAttributes.username_UNIQUE[0].value + " is already existing.");
      }
      $scope.$digest();
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
        $scope.newlyAdded = msg.data;
        setPage();
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

  io.socket.on('employees', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);

    switch (msg.verb) {
      case "created": 
        console.log("Employee Created");
        $scope.employees.push(msg.data);
        $scope.employees =  $scope.sortData($scope.employees,'emp_fname');
        $scope.user.fullname = $scope.employees[0];
        if($scope.noEmployees === true){
          $scope.noEmployees = false;
        }
        $scope.$digest();
        break;
      case "updated":
        console.log("Employee Updated");
        var index = _.findIndex($scope.employees,{'id': msg.data.id});
        console.log(index);
        $scope.employees[index] = msg.data;
        $scope.employees =  $scope.sortData($scope.employees,'emp_fname');
        $scope.user.fullname = $scope.employees[0];   
        console.log(msg.data);
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Employee Deleted");
        console.log(msg.data[0].emp_id);
        var index = _.findIndex($scope.employees,{'id': msg.data[0].emp_id});
        console.log(index);
        $scope.employees.splice(index,1);
        $scope.employees =  $scope.sortData($scope.employees,'emp_fname');
        $scope.user.fullname = $scope.employees[0];
        if($scope.employees.length === 0){
          $scope.noEmployees = true;
        }
        $scope.$digest();
    }

  });


  $scope.open = function (account) {
    console.log("Open Modal");

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'accountModalDelete.html',
      controller: 'AccountModalCtrl',
      resolve: {
        account: function () {
          return account;
        }
      }
    });

    modalInstance.result.then(function (account) {
      $scope.deleteUser(account);
    }, function () {
      console.log("close");
    });

  };

  $scope.openResetPwModal = function (account) {

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'resetPwordModal.html',
      controller: 'resetPwordModalCtrl',
      resolve: {
        account: function () {
          return account;
        }
      }
    });

    modalInstance.result.then(function (account) {
      console.log(account);
     }, function () {
      console.log("close");
    });

  };


}])

.controller('AccountModalCtrl', function ($scope, $modalInstance, account) {

  $scope.ok = function () {
    $modalInstance.close(account);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})

.controller('resetPwordModalCtrl', function ($scope, $modalInstance, account,authService) {
  $scope.resetMode = false;
  $scope.returnMsg = '';
  $scope.hasReturn = false;
  $scope.reset = {};
  
  $scope.closeMsg = function () {
    $scope.resetMode = false;
    $scope.returnMsg = '';
    $scope.hasReturn = false;
  }

  $scope.closeForm = function () {
    $scope.resetMode = false;
    $scope.reset = {};
  }

  $scope.socketOptions = function (method,url,headers,params) {
    return {
      method: method,
      url: url,
      headers: headers,
      params: params
    };
  };

  $scope.ok = function (user) {
    var resetInfo = {
      "user": account,
      "username": user.username,
      "password": user.password
    };

    io.socket.request($scope.socketOptions('post','/users/resetpassword',{"Authorization": "Bearer " + authService.getToken()}, resetInfo), function (body, JWR) {
      console.log('Sails responded with post user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.returnMsg = body;
        $scope.hasReturn = true;
        $scope.closeForm();
      }else if (JWR.statusCode === 400){
        $scope.returnMsg = body; 
        $scope.hasReturn = true;
      }
       $scope.$digest();
    
    });

    
  };

  $scope.close = function () {
    $modalInstance.close(); 
  }

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

