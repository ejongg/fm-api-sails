'use strict';

angular.module('fmApp')
.controller('EmployeesCtrl',['$scope', '_', '$http', 'httpHost','authService', '$modal', function($scope, _, $http, httpHost, authService, $modal){
	$scope.positions = ['Cashier','Checker','Delivery Helper','Delivery Sales Personnel','Driver','Encoder'];
  $scope.statuses = ['Contractual','Probational','Regular'];
  $scope.offices = ['Coke','FM Office','Beer'];
	$scope.employees = [];

  $scope.noEmployees = false;

	$scope.employee = {};
  $scope.employee.hire_date = new Date();
  $scope.employee.end_contract = new Date();

  $scope.employeeEdit = {};
  $scope.employeeEdit.hire_date = new Date();
  $scope.employeeEdit.end_contract = new Date();

  $scope.employeeDelete = {};
  $scope.employeeDelete.hire_date = new Date();
  $scope.employeeDelete.end_contract = new Date();

  $scope.copiedEmployee = {};

	$scope.addEmployeeForm = false;
	$scope.editOrDeleteEmployeeForm = false;
  $scope.editEmployeeTab = true;

  // forSorting
  $scope.sortCriteria='id';
  $scope.reverseSort = false;

	var getEmployees = function () {
    $http.get(httpHost + '/employees').success( function (data) {
      if(data.length !== 0){
        $scope.employees = data;
        console.log("Employees:");
        console.log($scope.employees);
      }else{
        $scope.noEmployees = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
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
     console.log("switch tab" + data);
      $scope.editEmployeeTab = data;
      if(data === true){
        $scope.employeeEdit = $scope.copiedEmployee;
        $scope.employeeEdit.emp_fname = $scope.copiedEmployee.emp_fname;
        $scope.employeeEdit.emp_lname = $scope.copiedEmployee.emp_lname;
        $scope.employeeEdit.office = $scope.copiedEmployee.office;
        $scope.employeeEdit.position = $scope.copiedEmployee.position;
        $scope.employeeEdit.hire_date = new Date($scope.copiedEmployee.hire_date);
        $scope.employeeEdit.end_contract = new Date($scope.copiedEmployee.end_contract);
        console.log($scope.employeeEdit);
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
    $scope.employeeEdit.status = $scope.copiedEmployee.status;
    $scope.employeeEdit.hire_date = new Date($scope.copiedEmployee.hire_date);
    $scope.employeeEdit.end_contract = new Date($scope.copiedEmployee.end_contract);
    
    $scope.employeeDelete.id = $scope.copiedEmployee.id;
    $scope.employeeDelete.emp_fname = $scope.copiedEmployee.emp_fname;
    $scope.employeeDelete.emp_lname = $scope.copiedEmployee.emp_lname;
    $scope.employeeDelete.office = $scope.copiedEmployee.office;
    $scope.employeeDelete.position = $scope.copiedEmployee.position;
    $scope.employeeDelete.status = $scope.copiedEmployee.status;
    $scope.employeeDelete.hire_date = new Date($scope.copiedEmployee.hire_date);
    $scope.employeeDelete.end_contract = new Date($scope.copiedEmployee.end_contract);

    $scope.showEditOrDeleteEmployeeForm(true);
  };

  var clearForm = function () {
    $scope.employeeForm.$setPristine();
    $scope.employee.emp_fname = '';
    $scope.employee.emp_lname = '';
    $scope.employee.office =  $scope.offices[0];
    $scope.employee.position = $scope.positions[0];
    $scope.employee.hire_date = new Date();
    $scope.employee.end_contract = new Date();
  }; 

	$scope.addEmployee = function (employee) {

    var employeeInfo = {
      "emp_fname": employee.emp_fname,
      "emp_lname": employee.emp_lname,
      "office": employee.office,
      "position": employee.position,
      "hire_date":  $scope.formatDate(employee.hire_date),
      "end_contract": $scope.formatDate(employee.end_contract),
      "status": employee.status
    };

    console.log(employeeInfo);

    io.socket.request($scope.socketOptions('post','/employees/add',{"Authorization": "Bearer " + authService.getToken()},employeeInfo), function (body, JWR) {
      console.log('Sails responded with post employee: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
        $scope.showAddEmployeeForm(false);
        $scope.snackbarShow('Employee Added');
        $scope.$digest(); 
      }
    });   
	}; 

	$scope.editEmployee = function (employee) {
    io.socket.request($scope.socketOptions('put','/employees/' + employee.id,{"Authorization": "Bearer " + authService.getToken()},employee), function (body, JWR) {
      console.log('Sails responded with edit employee: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.showEditOrDeleteEmployeeForm(false);
        $scope.snackbarShow('Employee Edited'); 
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
        $scope.snackbarShow('Employee Deleted'); 
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
        $scope.$digest();
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

    $scope.open = function (employee) {
    console.log("Open Modal");

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'employeeModalDelete.html',
      controller: 'EmployeeModalCtrl',
      resolve: {
        employee: function () {
          return employee;
        }
      }
    });

    modalInstance.result.then(function (employee) {
      $scope.deleteEmployee(employee);
    }, function () {
      console.log("close");
    });

  };

}])

  .controller('EmployeeModalCtrl', function ($scope, $modalInstance, employee) {

  $scope.ok = function () {
    $modalInstance.close(employee);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

