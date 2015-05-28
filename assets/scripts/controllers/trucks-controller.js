'use strict';

angular.module('fmApp')
.controller('TrucksCtrl',['$scope','_','$http','httpHost', 'authService', '$modal', function($scope, _, $http, httpHost, authService, $modal){
  $scope.trucks = [];
  $scope.editIndex = -1;
  $scope.truck = {};
  $scope.truckEdit = {};

  $scope.employeeDrivers = [];
  $scope.employeeCheckers = [];
  $scope.employeeDeliverySalesPersonnel = [];
  $scope.employeeDeliveryHelper = [];
  $scope.routes = [];



  $scope.noTrucks = false;
  $scope.noRoute = false;
  $scope.noTruckDriver = false;
  $scope.noChecker = false;
  $scope.noDSP = false;
  $scope.noDH = false;
  $scope.noRoute = false;

  $scope.addTruckForm = false;

  var getTrucks = function () {
  $http.get(httpHost + '/trucks').success( function (data) {
     console.log("Trucks");
      if(data.length !== 0){
        $scope.trucks = data; 
 
        console.log("Trucks:");
        console.log($scope.trucks);
      }else{
        $scope.noTrucks = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  var getRoutes = function () {
    $http.get(httpHost + '/routes').success(function(data){

     if (data.length !== 0){
        $scope.routes = data;
        $scope.truck.route = $scope.routes[0];
        $scope.truckEdit.route = $scope.routes[0];
        console.log("Routes");
        console.log($scope.routes);
     }else{
        $scope.noRoute = true;
     }

    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  var getDrivers = function () {
    $http.get(httpHost + '/employees/list?position=Driver').success(function(data){
    
     if (data.length !== 0){
        $scope.employeeDrivers = data;
        $scope.truck.driver = $scope.employeeDrivers[0];
        $scope.truckEdit.driver = $scope.employeeDrivers[0];
        console.log($scope.truckEdit.driver);
        console.log("Drivers");
        console.log($scope.employeeDrivers);
     }else{
       $scope.noTruckDriver = true;
     }

    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  var getCheckers = function () {
    $http.get(httpHost + '/employees/list?position=Checker').success(function(data){

     if (data.length !== 0){
       $scope.employeeCheckers = data;
       $scope.truck.dispatcher = $scope.employeeCheckers[0];
       $scope.truckEdit.dispatcher = $scope.employeeCheckers[0];
       console.log("Checkers");
       console.log($scope.employeeCheckers);
     }else{
       $scope.noChecker = true;
     }

    }).error(function (err) {
      $scope.checkError(err);
    });
  };
  
  var getDeliverySalesPersonel = function () {
    $http.get(httpHost + '/employees/list?position=Delivery Sales Personnel').success(function(data){
     
     if (data.length !== 0){
       $scope.employeeDeliverySalesPersonnel = data;
       $scope.truck.agent = $scope.employeeDeliverySalesPersonnel[0];
       $scope.truckEdit.agent = $scope.employeeDeliverySalesPersonnel[0];
       console.log("Delivery Sales Personel");
       console.log($scope.employeeDeliverySalesPersonnel);
     }else{
       $scope.noDSP = true;
     }

    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  var getDeliveryHelper = function () {
    $http.get(httpHost + '/employees/list?position=Delivery Helper').success(function(data){
     
     if (data.length !== 0){
       $scope.employeeDeliveryHelper = data;
       $scope.truck.helper = $scope.employeeDeliveryHelper[0];
       $scope.truckEdit.helper = $scope.employeeDeliveryHelper[0];
       console.log("Delivery Helper");
       console.log($scope.employeeDeliveryHelper);
     }else{
       $scope.noDH = true;
     }

    }).error(function (err) {
      $scope.checkError(err);
    });
  };
  
  getTrucks();
  getDrivers();
  getCheckers();
  getDeliverySalesPersonel();
  getDeliveryHelper();
  getRoutes();
  

  $scope.showAddTruckForm = function (data) {
    if(data === true){
      $scope.editIndex = -1;
    }
    $scope.addTruckForm = data;
      if(data === false){
        clearForm();
      }
  };
  
  var clearForm = function () {
    $scope.truck.route = $scope.routes[0];
    $scope.truck.driver = $scope.employeeDrivers[0];
    $scope.truck.dispatcher = $scope.employeeCheckers[0];
    $scope.truck.agent = $scope.employeeDeliverySalesPersonnel[0];
    $scope.truck.helper = $scope.employeeDeliveryHelper[0];
  }; 

  $scope.fullName = function (driver) {
    return driver.emp_fname + ' ' + driver.emp_lname;
  };

  $scope.truckEditClicked = function (index,truck) {
    if($scope.addTruckForm === true){
      $scope.showAddTruckForm(false);
    }

    if(index !== -1){
      $scope.truckEdit.carry_weight = angular.copy(truck.carry_weight);
      $scope.truckEdit.id = angular.copy(truck.id);
      $scope.editIndex = index;
    }else{
      $scope.editIndex = -1;
    }

  };

  $scope.addTruck = function (truck) {
      console.log("Add Truck");
      console.log(truck);

      var truckInfo = {
        "agent": truck.agent,
        "dispatcher": truck.dispatcher,
        "driver": truck.driver,
        "helper": truck.helper,
        "route": truck.route.route_name,
        "carry_weight": 0
      };

      console.log(truckInfo);
      
      io.socket.request($scope.socketOptions('post','/trucks/add',{"Authorization": "Bearer " + authService.getToken()},truckInfo), function (body, JWR) {
      console.log('Sails responded with post truck: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
        $scope.showAddTruckForm(false);
        $scope.$digest();
      }
      });  

  }; 

  $scope.editTruck = function (truck) {
      console.log("Edit Truck");
      console.log(truck);
      var editInfo = {
        "agent": truck.agent,
        "dispatcher": truck.dispatcher,
        "driver": truck.driver,
        "helper": truck.helper,
        "route": truck.route.route_name,
        "carry_weight": truck.carry_weight
      };

      console.log(editInfo);
      console.log(truck.id);

    io.socket.request($scope.socketOptions('put','/trucks/' + truck.id,{"Authorization": "Bearer " + authService.getToken()},editInfo), function (body, JWR) {
      console.log('Sails responded with edit truck: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
         $scope.editIndex = -1;
         $scope.$digest();
      }
    });
  };

  $scope.deleteTruck = function (truckId) {
  
    io.socket.request($scope.socketOptions('delete','/trucks/' + truckId,{"Authorization": "Bearer " + authService.getToken()}), function (body, JWR) {
      console.log('Sails responded with delete user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
         $scope.editIndex = -1;
         $scope.$digest();
      }
    }); 
  };


  io.socket.on('trucks', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);

    switch (msg.verb) {
      case "created": 
        console.log("Truck Created");
        $scope.trucks.push(msg.data);
        if($scope.noTrucks === true){
          $scope.noTrucks = false;
        }
        $scope.$digest();
        break;
      case "updated": 
        console.log("Truck Updated");
        var index = _.findIndex($scope.trucks, {id : msg.data.id});
        console.log(index);
        $scope.trucks[index] = msg.data;
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Truck Deleted");
        console.log(msg.data);
        var index = _.findIndex($scope.trucks, {id : msg.data[0].truck_id});
        console.log(index);
        $scope.trucks.splice(index,1);   
        if($scope.trucks.length === 0){
          $scope.noTrucks = true;
        }
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
        switch (msg.data.position){
          case "Driver":
            $scope.employeeDrivers.push(msg.data);
          break;
          case "Checker":
            $scope.employeeCheckers.push(msg.data);
          break;
          case "Delivery Sales Personnel":
            $scope.employeeDeliverySalesPersonnel.push(msg.data);
          break;
          case "Delivery Helper":
            $scope.employeeDeliveryHelper.push(msg.data);
        }
        $scope.$digest();
        break;
      case "updated":
        console.log("Employee Updated");
        var index = 0;
        switch (msg.data.position){
          case "Driver":
            index = _.findIndex($scope.employeeDrivers,{'id': msg.data.id});
            $scope.employeeDrivers[index] = msg.data;
            $scope.truck.driver = $scope.employeeDrivers[0];
            $scope.truckEdit.driver = $scope.employeeDrivers[0];
          break;
          case "Checker":
            index = _.findIndex($scope.employeeCheckers,{'id': msg.data.id});
            $scope.employeeCheckers[index] = msg.data;
            $scope.truck.dispatcher = $scope.employeeCheckers[0];
            $scope.truckEdit.dispatcher = $scope.employeeCheckers[0];
          break;
          case "Delivery Sales Personnel":
            index = _.findIndex($scope.employeeDeliverySalesPersonnel,{'id': msg.data.id});
            $scope.employeeDeliverySalesPersonnel[index] = msg.data;
            $scope.truck.agent = $scope.employeeDeliverySalesPersonnel[0];
            $scope.truckEdit.agent = $scope.employeeDeliverySalesPersonnel[0];
          break;
          case "Delivery Helper":
            index = _.findIndex($scope.employeeDeliveryHelper,{'id': msg.data.id});
            $scope.employeeDeliveryHelper[index] = msg.data;
            $scope.truck.helper = $scope.employeeDeliveryHelper[0];
            $scope.truckEdit.helper = $scope.employeeDeliveryHelper[0];
        }
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Employee Deleted");
        var index = 0;
        switch (msg.data[0].position){
          case "Driver":
            index = _.findIndex($scope.employeeDrivers,{'id': msg.data[0].emp_id});
            console.log(index);
            $scope.employeeDrivers.splice(index,1);
          break;
          case "Checker":
            index = _.findIndex($scope.employeeCheckers,{'id': msg.data[0].emp_id});
            console.log(index);
            $scope.employeeCheckers.splice(index,1);
          break;
          case "Delivery Sales Personnel":
            index = _.findIndex($scope.employeeDeliverySalesPersonnel,{'id': msg.data[0].emp_id});
            console.log(index);
            $scope.employeeDeliverySalesPersonnel.splice(index,1);
          break;
          case "Delivery Helper":
            index = _.findIndex($scope.employeeDeliveryHelper,{'id': msg.data[0].emp_id});
            console.log(index);
            $scope.employeeDeliveryHelper.splice(index,1);
        }
        $scope.$digest();
    }
  });

  io.socket.on('routes', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);

    switch (msg.verb) {
      case "created": 
        console.log("Route Created");
        $scope.routes.push(msg.data);
        if($scope.noRoute === true){
          $scope.noRoute = false;
        }
        $scope.$digest();
        break;
      case "updated": 
        console.log("Route Updated");
        var index = _.findIndex($scope.routes,{'id': msg.data.id});
        console.log(index);
        $scope.routes[index] = msg.data;   
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Route Deleted");
        console.log(msg.data[0]);
        var index = _.findIndex($scope.routes,{'id': msg.data[0].route_id});
        console.log(index);
        $scope.routes.splice(index,1);
        if($scope.routes.length === 0){
          $scope.noRoutes = true;
        }
        $scope.$digest();
    }

  });

  $scope.open = function (truckId) {
    console.log("Open Modal");

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'truckModalDelete.html',
      controller: 'TruckModalCtrl',
      resolve: {
        truckId: function () {
          return truckId;
        }
      }
    });

    modalInstance.result.then(function (truckId) {
      $scope.deleteTruck(truckId);
    }, function () {
      console.log("close");
    });

  };

}])
 
 .controller('TruckModalCtrl', function ($scope, $modalInstance, truckId) {

  $scope.ok = function () {
    $modalInstance.close(truckId);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});


