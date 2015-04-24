'use strict';

angular.module('fmApp')
.controller('EmployeesCtrl',['$scope', '_', '$http', 'httpHost','authService', function($scope, _, $http, httpHost, authService){
	$scope.positions = ['Driver','Checker','Delivery Sales Personel','Delivery Helper'];
	$scope.employees = [];

  $scope.noEmployees = true;

	$scope.employee = {};
  $scope.employeeEdit = {};
  $scope.employeeDelete = {};
  $scope.copiedEmployee = {};

	$scope.addEmployeeForm = false;
	$scope.editOrDeleteEmployeeForm = false;
  $scope.editEmployeeTab = true;
  $scope.sortCriteria = "";

	var getEmployees = function () {
    $http.get(httpHost + '/employees').success( function (data) {
      if(data.length !== 0){
        $scope.employees = data;
        $scope.noEmployees = false;

        console.log("Employees:");
        console.log($scope.employees);
      }
    }).error(function (err) {
      console.log(err);
    });
	};

  getEmployees();

  $scope.pagePrint = function () {
    window.print();
  };

	$scope.showAddEmployeeForm = function (data) {
      $scope.addEmployeeForm = data;
      if($scope.editOrDeleteEmployeeForm === true) {
        $scope.showEditOrDeleteEmployeeForm(false);
      }
      if(data === false){
        clearForm();
      }
	};

	$scope.showEditOrDeleteEmployeeForm = function (data) {
      $scope.editOrDeleteEmployeeForm = data;
      if($scope.editEmployeeTab === false){
        $scope.setEditEmployeeTab(true);
      }
	};

	$scope.setEditEmployeeTab = function (data) {
      $scope.editEmployeeTab = data;
      if(data === true){
        // $scope.userEdit.username = $scope.copiedUser.username;
        // $scope.userEdit.password = $scope.copiedUser.password;
        // $scope.userEdit.firstname = $scope.copiedUser.firstname;
        // $scope.userEdit.lastname = $scope.copiedUser.lastname;
        // $scope.userEdit.type = $scope.copiedUser.type;
      } 
	};
    
  $scope.employeeClicked = function (employee) {
    if($scope.addEmployeeForm === true){
      $scope.showAddEmployeeForm(false);
    }
    $scope.copiedEmployee = angular.copy(employee);
    $scope.employeeEdit.id = $scope.copiedEmployee.id;
    $scope.employeeEdit.emp_fname = $scope.copiedEmployee.emp_fname;
    $scope.employeeEdit.emp_lname = $scope.copiedEmployee.emp_lname;
    $scope.employeeEdit.office = $scope.copiedEmployee.office;
    $scope.employeeEdit.position = $scope.copiedEmployee.position;
    
    $scope.employeeDelete.id = $scope.copiedEmployee.id;
    $scope.employeeDelete.emp_fname = $scope.copiedEmployee.emp_fname;
    $scope.employeeDelete.emp_lname = $scope.copiedEmployee.emp_lname;
    $scope.employeeDelete.office = $scope.copiedEmployee.office;
    $scope.employeeDelete.position = $scope.copiedEmployee.position;

    $scope.showEditOrDeleteEmployeeForm(true);
  };

  var clearForm = function () {
    $scope.employeeForm.$setPristine();
    $scope.employee.emp_fname = '';
    $scope.employee.emp_lname = '';
    $scope.employee.office = '';
    $scope.employee.position = $scope.positions[0];
  }; 

	$scope.addEmployee = function (employee) {
    io.socket.request($scope.socketOptions('post','/employees/add',{"Authorization": "Bearer " + authService.getToken()},employee), function (body, JWR) {
      console.log('Sails responded with post employee: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
        $scope.showAddEmployeeForm(false);
        $scope.$digest(); 
      }
    });   
	}; 

	$scope.editEmployee = function (employee) {
      // console.log(newInfo);
      // $sailsSocket.put('/users/' + newInfo.id, newInfo).success(function (data) {
      //   var index = _.findIndex($scope.users, function(user) { return user.id == data.id; });
      //   $scope.users[index] = data;
      //   $scope.showEditOrDeleteUserForm(false);
      // }).error(function (err) {
      //   console.log(err);
      // });


    io.socket.request($scope.socketOptions('put','/employees/' + employee.id,{"Authorization": "Bearer " + authService.getToken()},employee), function (body, JWR) {
      console.log('Sails responded with edit employee: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.showEditOrDeleteEmployeeForm(false); 
        $scope.$digest(); 
      }
    });
	};

	$scope.deleteEmployee = function (employee) {
    io.socket.request($scope.socketOptions('delete','/employees/' + employee.id,{"Authorization": "Bearer " + authService.getToken()}), function (body, JWR) {
      console.log('Sails responded with delete employee: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.showEditOrDeleteEmployeeForm(false); 
        $scope.$digest(); 
      }
    }); 
	};

  io.socket.on('employees', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);

    switch (msg.verb) {
      case "created": 
        console.log("Employee Created");
        $scope.employees.push(msg.data);
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
        console.log(msg.data);
        break;
      case "destroyed":
        console.log("Employee Deleted");
        console.log(msg.data[0].emp_id);
        var index = _.findIndex($scope.employees,{'id': msg.data[0].emp_id});
        console.log(index);
        $scope.employees.splice(index,1);
        if($scope.employees.length === 0){
          $scope.noEmployees = true;
        }
        $scope.$digest();
    }

  });


}]);
