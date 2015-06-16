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

  $scope.employeeDriversEdit = [];
  $scope.employeeCheckersEdit = [];
  $scope.employeeDeliverySalesPersonnelEdit = [];
  $scope.employeeDeliveryHelperEdit = [];
  $scope.routesEdit = [];

  $scope.errorMessage = '';
  $scope.hasError = false;

  $scope.noTrucks = false;
  $scope.noTruckDriver = false;
  $scope.noChecker = false;
  $scope.noDSP = false;
  $scope.noDH = false;
  $scope.noRoute = false;

  $scope.addTruckForm = false;

  var getTrucks = function () {
  $http.get(httpHost + '/trucks/list').success( function (data) {
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
    $http.get(httpHost + '/routes/unassigned').success(function(data){

     if (data.length !== 0){
        $scope.routes = $scope.sortData(data,'route_name');
        $scope.truck.route = $scope.routes[0];
        // $scope.truckEdit.route = $scope.routes[0];
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
        $scope.employeeDrivers = $scope.sortData(data,'emp_fname');
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
       $scope.employeeCheckers = $scope.sortData(data,'emp_fname');
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
       $scope.employeeDeliverySalesPersonnel = $scope.sortData(data,'emp_fname');
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
       $scope.employeeDeliveryHelper = $scope.sortData(data,'emp_fname');
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

   $scope.combine = function (route){
    return route.route_name + ' ' + route.company;
  };
  

   $scope.showErrorMessage = function (data,msg) {
     $scope.hasError = data;
     console.log($scope.hasError);
    if(data === true){
       console.log(data);
       console.log(msg);
       $scope.errorMessage = msg;
       clearForm();
    }
  }


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
    $scope.truck.carry_weight = null;
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
      

      $scope.employeeDriversEdit = angular.copy($scope.employeeDrivers);
      $scope.employeeCheckersEdit = angular.copy($scope.employeeCheckers);
      $scope.employeeDeliverySalesPersonnelEdit = angular.copy($scope.employeeDeliverySalesPersonnel);
      $scope.employeeDeliveryHelperEdit = angular.copy($scope.employeeDeliveryHelper);
      $scope.routesEdit = angular.copy($scope.routes);

      $scope.employeeDriversEdit.unshift(truck.driver);
      $scope.employeeCheckersEdit.unshift(truck.dispatcher);
      $scope.employeeDeliverySalesPersonnelEdit.unshift(truck.agent);
      $scope.employeeDeliveryHelperEdit.unshift(truck.helper);
      $scope.routesEdit.unshift(truck.route);

      $scope.truckEdit.driver = truck.driver;
      $scope.truckEdit.dispatcher = truck.dispatcher;
      $scope.truckEdit.agent = truck.agent;
      $scope.truckEdit.helper = truck.helper;
      $scope.truckEdit.route = truck.route;

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
        "route": truck.route.id,
        "carry_weight": truck.carry_weight
      };

      console.log(truckInfo);
      
      io.socket.request($scope.socketOptions('post','/trucks/add',{"Authorization": "Bearer " + authService.getToken()},truckInfo), function (body, JWR) {
      console.log('Sails responded with post truck: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.snackbarShow('Truck Added');
        $scope.showAddTruckForm(false);
        var indexDriver = _.findIndex($scope.employeeDrivers, {'id' : truck.driver.id});
        $scope.employeeDrivers.splice(indexDriver,1);
        $scope.employeeDrivers = $scope.sortData($scope.employeeDrivers ,'emp_fname');
        $scope.truck.driver = $scope.employeeDrivers[0];

        var indexDispatcher = _.findIndex($scope.employeeCheckers, {'id' : truck.dispatcher.id});
        $scope.employeeCheckers.splice(indexDriver,1);
        $scope.employeeCheckers = $scope.sortData($scope.employeeCheckers,'emp_fname');
        $scope.truck.dispatcher = $scope.employeeCheckers[0];
       

        var indexAgent = _.findIndex($scope.employeeDeliverySalesPersonnel, {'id' : truck.agent.id});
        $scope.employeeDeliverySalesPersonnel.splice(indexAgent,1);
        $scope.employeeDeliverySalesPersonnel = $scope.sortData($scope.employeeDeliverySalesPersonnel,'emp_fname');
        $scope.truck.agent = $scope.employeeDeliverySalesPersonnel[0];
     

        var indexHelper = _.findIndex($scope.employeeDeliveryHelper, {'id' : truck.helper.id});
        $scope.employeeDeliveryHelper.splice(indexHelper,1);
        $scope.employeeDeliveryHelper = $scope.sortData($scope.employeeDeliveryHelper,'emp_fname');
        $scope.truck.helper = $scope.employeeDeliveryHelper[0];
  

        var indexRoute = _.findIndex($scope.routes, {'id' : truck.route.id});
        $scope.routes.splice(indexRoute,1);
        $scope.routes = $scope.sortData($scope.routes,'route_name');
        $scope.truck.route = $scope.routes[0];

        $scope.$digest();
      }
      });  

  }; 

  $scope.editTruck = function (truck) {
      console.log("Edit Truck");
      console.log(truck);
      // var editInfo = {
      //   "agent": truck.agent.id,
      //   "dispatcher": truck.dispatcher.id,
      //   "driver": truck.driver.id,
      //   "helper": truck.helper.id,
      //   "route": truck.route.id,
      //   "carry_weight": truck.carry_weight
      // };
      console.log(truck.id);

    io.socket.request($scope.socketOptions('post','/trucks/edit',{"Authorization": "Bearer " + authService.getToken()},truck), function (body, JWR) {
      console.log('Sails responded with edit truck: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
         $scope.editIndex = -1;
         $scope.snackbarShow('Truck Edited');
         $scope.$digest();
      }
    });
  };

  $scope.deleteTruck = function (truckId) {
  
    io.socket.request($scope.socketOptions('delete','/trucks/remove?id=' + truckId,{"Authorization": "Bearer " + authService.getToken()}), function (body, JWR) {
      console.log('Sails responded with delete user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
         $scope.editIndex = -1;
         $scope.snackbarShow('Truck Deleted');
      }
      else if (JWR.statusCode === 500){
        console.log("Error Occured");
        $scope.showErrorMessage(true,body);
      }

       $scope.$digest();
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
      case "replaced": 
        console.log("Truck Created");
        
        if(msg.data.prev_employees != null){
        for(var i = 0; i < msg.data.prev_employees.length ; i++){
        console.log(msg.data.prev_employees[i]);


          switch(msg.data.prev_employees[i].position){
            case "Driver":
            $scope.employeeDrivers.push(msg.data.prev_employees[i]); 
            break;
            case "Checker":
            $scope.employeeCheckers.push(msg.data.prev_employees[i]); 
            break;
            case "Delivery Sales Personnel":
            $scope.employeeDeliverySalesPersonnel.push(msg.data.prev_employees[i]);
            break;
            case "Delivery Helper":
            $scope.employeeDeliveryHelper.push(msg.data.prev_employees[i]);
            
          }

        }
        }
        
        if(msg.data.new_employees != null){
        for(var i = 0; i < msg.data.new_employees.length ; i++){
        console.log(msg.data.new_employees[i]);

          
          switch(msg.data.new_employees[i].position){
            case "Driver":
            index = _.findIndex($scope.employeeDrivers,{'id': msg.data.new_employees[i].id});
            console.log(index);
            $scope.employeeDrivers.splice(index,1);    
            break;
            case "Checker":
            index = _.findIndex($scope.employeeCheckers,{'id': msg.data.new_employees[i].id});
            console.log(index);
            $scope.employeeCheckers.splice(index,1);
            break;
            case "Delivery Sales Personnel":
            index = _.findIndex($scope.employeeDeliverySalesPersonnel,{'id': msg.data.new_employees[i].id});
            console.log(index);
            $scope.employeeDeliverySalesPersonnel.splice(index,1);
            break;
            case "Delivery Helper":
             index = _.findIndex($scope.employeeDeliveryHelper,{'id': msg.data.new_employees[i].id});
            console.log(index);
            $scope.employeeDeliveryHelper.splice(index,1);
          }


        }
       }

       if(msg.data.prev_route != null){
          $scope.routes.push(msg.data.prev_route); 
          $scope.routes = $scope.sortData($scope.routes,'route_name');
          $scope.truck.route = $scope.routes[0];
       }

       if(msg.data.new_route != null){
          index = _.findIndex($scope.routes,{'id': msg.data.new_route.id});
         console.log(index);
         $scope.routes.splice(index,1);
          $scope.routes = $scope.sortData($scope.routes,'route_name');
          $scope.truck.route = $scope.routes[0];
       }
       
         $scope.employeeDrivers = $scope.sortData($scope.employeeDrivers ,'emp_fname');
         $scope.truck.driver = $scope.employeeDrivers[0];
         $scope.employeeCheckers = $scope.sortData($scope.employeeCheckers,'emp_fname');
         $scope.truck.dispatcher = $scope.employeeCheckers[0];
         $scope.employeeDeliverySalesPersonnel = $scope.sortData($scope.employeeDeliverySalesPersonnel,'emp_fname');
         $scope.truck.agent = $scope.employeeDeliverySalesPersonnel[0];
         $scope.employeeDeliveryHelper = $scope.sortData($scope.employeeDeliveryHelper,'emp_fname');
         $scope.truck.helper = $scope.employeeDeliveryHelper[0];

        break;
      case "destroyed":
        console.log("Truck Deleted");
        var index = _.findIndex($scope.trucks, {id : msg.data.id});
        console.log(index);
        $scope.trucks.splice(index,1);

        $scope.employeeDrivers.push(msg.data.driver);
        $scope.employeeCheckers.push(msg.data.dispatcher);
        $scope.employeeDeliverySalesPersonnel.push(msg.data.agent);
        $scope.employeeDeliveryHelper.push(msg.data.helper);
        $scope.routes.push(msg.data.route);


        $scope.employeeDrivers = $scope.sortData($scope.employeeDrivers ,'emp_fname');
        $scope.truck.driver = $scope.employeeDrivers[0];
        // $scope.truckEdit.driver = $scope.employeeDrivers[0];

    
        $scope.employeeCheckers = $scope.sortData($scope.employeeCheckers,'emp_fname');
        $scope.truck.dispatcher = $scope.employeeCheckers[0];
        //$scope.truckEdit.dispatcher = $scope.employeeCheckers[0];

        $scope.employeeDeliverySalesPersonnel = $scope.sortData($scope.employeeDeliverySalesPersonnel,'emp_fname');
        $scope.truck.agent = $scope.employeeDeliverySalesPersonnel[0];
        //$scope.truckEdit.agent = $scope.employeeDeliverySalesPersonnel[0];

        $scope.employeeDeliveryHelper = $scope.sortData($scope.employeeDeliveryHelper,'emp_fname');
        $scope.truck.helper = $scope.employeeDeliveryHelper[0];
        //$scope.truckEdit.helper = $scope.employeeDeliveryHelper[0];
        
        $scope.routes = $scope.sortData($scope.routes,'route_name');
        $scope.truck.route = $scope.routes[0];
        //$scope.truckEdit.route = $scope.routes[0];

        if($scope.noTruckDriver === true){
          $scope.noTruckDriver = false;
        }

        if($scope.noChecker === true){
          $scope.noChecker = false;
        }

        if($scope.noDSP === true){
          $scope.noDSP = false;
        }

        if($scope.noDH === true){
          $scope.noDH = false;
        }

        if($scope.noRoute === true){
          $scope.noRoute = false;
        }


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
        console.log(msg.data.position);
        switch (msg.data.position){
          case "Driver":
            $scope.employeeDrivers.push(msg.data);
            $scope.employeeDrivers = $scope.sortData($scope.employeeDrivers,'emp_fname');
            $scope.truck.driver = $scope.employeeDrivers[0];

            if($scope.employeeDriversEdit.length !== 0){
              $scope.employeeDriversEdit.push(msg.data);
            }

            //$scope.truckEdit.driver = $scope.employeeDrivers[0];
            if($scope.noTruckDriver === true){
              $scope.noTruckDriver = false;
            }
          break;
          case "Checker":
            $scope.employeeCheckers.push(msg.data);
            $scope.employeeCheckers = $scope.sortData($scope.employeeCheckers,'emp_fname');
            $scope.truck.dispatcher = $scope.employeeCheckers[0];
            //$scope.truckEdit.dispatcher = $scope.employeeCheckers[0];
            if($scope.employeeCheckersEdit.length !== 0){
              $scope.employeeCheckersEdit.push(msg.data);
            }

            if($scope.noChecker === true){
              $scope.noChecker = false;
            }
          break;
          case "Delivery Sales Personnel":
            $scope.employeeDeliverySalesPersonnel.push(msg.data);
            $scope.employeeDeliverySalesPersonnel = $scope.sortData($scope.employeeDeliverySalesPersonnel,'emp_fname');
            $scope.truck.agent = $scope.employeeDeliverySalesPersonnel[0];
            //$scope.truckEdit.agent = $scope.employeeDeliverySalesPersonnel[0];
            if($scope.employeeDeliverySalesPersonnelEdit.length !== 0){
               $scope.employeeDeliverySalesPersonnelEdit.push(msg.data);
            }

            if($scope.noDSP === true){
              $scope.noDSP = false;
            }
          break;
          case "Delivery Helper":
            $scope.employeeDeliveryHelper.push(msg.data);
            $scope.employeeDeliveryHelper = $scope.sortData($scope.employeeDeliveryHelper,'emp_fname');
            $scope.truck.helper = $scope.employeeDeliveryHelper[0];
            //$scope.truckEdit.helper = $scope.employeeDeliveryHelper[0];
             if($scope.employeeDeliveryHelperEdit.length !== 0){
               $scope.employeeDeliveryHelperEdit.push(msg.data);
            }

            if($scope.noDH === true){
              $scope.noDH = false;
            }
        }
        $scope.$digest();
        break;
      case "updated":
        console.log("Employee Updated");
        var index = 0;
        var indexEdit = 0;
        switch (msg.data.position){
          case "Driver":
            index = _.findIndex($scope.employeeDrivers,{'id': msg.data.id});
            $scope.employeeDrivers[index] = msg.data;
            $scope.truck.driver = $scope.employeeDrivers[0];

            if($scope.employeeDriversEdit.length !== 0){
              indexEdit = _.findIndex($scope.employeeDriversEdit,{'id': msg.data.id});
              $scope.employeeDriversEdit[index] = msg.data;
            }
            //$scope.truckEdit.driver = $scope.employeeDrivers[0];
          break;
          case "Checker":
            index = _.findIndex($scope.employeeCheckers,{'id': msg.data.id});
            $scope.employeeCheckers[index] = msg.data;
            $scope.truck.dispatcher = $scope.employeeCheckers[0];
            //$scope.truckEdit.dispatcher = $scope.employeeCheckers[0];

            if($scope.employeeCheckersEdit.length !== 0){
              indexEdit = _.findIndex($scope.employeeCheckersEdit,{'id': msg.data.id});
              $scope.employeeCheckersEdit[index] = msg.data;
            }
          break;
          case "Delivery Sales Personnel":
            index = _.findIndex($scope.employeeDeliverySalesPersonnel,{'id': msg.data.id});
            $scope.employeeDeliverySalesPersonnel[index] = msg.data;
            $scope.truck.agent = $scope.employeeDeliverySalesPersonnel[0];
            //$scope.truckEdit.agent = $scope.employeeDeliverySalesPersonnel[0];
            if($scope.employeeDeliverySalesPersonnelEdit.length !== 0){
              indexEdit = _.findIndex($scope.employeeDeliverySalesPersonnelEdit,{'id': msg.data.id});
              $scope.employeeDeliverySalesPersonnelEdit[index] = msg.data;
            }
          break;
          case "Delivery Helper":
            index = _.findIndex($scope.employeeDeliveryHelper,{'id': msg.data.id});
            $scope.employeeDeliveryHelper[index] = msg.data;
            $scope.truck.helper = $scope.employeeDeliveryHelper[0];
            //$scope.truckEdit.helper = $scope.employeeDeliveryHelper[0];
            if($scope.employeeDeliveryHelperEdit.length !== 0){
              indexEdit = _.findIndex($scope.employeeDeliveryHelperEdit,{'id': msg.data.id});
              $scope.employeeDeliveryHelperEdit[index] = msg.data;
            }

        }
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Employee Deleted");
        var index = 0;
        var indexEdit = 0;
        switch (msg.data[0].position){
          case "Driver":
            index = _.findIndex($scope.employeeDrivers,{'id': msg.data[0].emp_id});
            console.log(index);
            $scope.employeeDrivers.splice(index,1);
            $scope.employeeDrivers = $scope.sortData($scope.employeeDrivers,'emp_fname');
            $scope.truck.driver = $scope.employeeDrivers[0];
            //$scope.truckEdit.driver = $scope.employeeDrivers[0];
            if($scope.employeeDriversEdit.length !== 0){
              indexEdit = _.findIndex($scope.employeeDriversEdit,{'id':  msg.data[0].emp_id});
              console.log(indexEdit);
              $scope.employeeDriversEdit.splice(indexEdit,1);
            }
            
            if($scope.employeeDrivers.length === 0){
              $scope.noTruckDriver = true;
            }
          break;
          case "Checker":
            index = _.findIndex($scope.employeeCheckers,{'id': msg.data[0].emp_id});
            console.log(index);
            $scope.employeeCheckers.splice(index,1);
            $scope.employeeCheckers = $scope.sortData($scope.employeeCheckers,'emp_fname');
            $scope.truck.dispatcher = $scope.employeeCheckers[0];
            //$scope.truckEdit.dispatcher = $scope.employeeCheckers[0];
            
            if($scope.employeeCheckersEdit.length !== 0){
               indexEdit = _.findIndex($scope.employeeCheckersEdit,{'id':  msg.data[0].emp_id});
               $scope.employeeCheckersEdit.splice(indexEdit,1);
            }

            if($scope.employeeCheckers.length === 0){
              $scope.noChecker = true;
            }
          break;
          case "Delivery Sales Personnel":
            index = _.findIndex($scope.employeeDeliverySalesPersonnel,{'id': msg.data[0].emp_id});
            console.log(index);
            $scope.employeeDeliverySalesPersonnel.splice(index,1);
            $scope.employeeDeliverySalesPersonnel = $scope.sortData($scope.employeeDeliverySalesPersonnel,'emp_fname');
            $scope.truck.agent = $scope.employeeDeliverySalesPersonnel[0];
           // $scope.truckEdit.agent = $scope.employeeDeliverySalesPersonnel[0];

            if($scope.employeeDeliverySalesPersonnelEdit.length !== 0){
              indexEdit = _.findIndex($scope.employeeDeliverySalesPersonnelEdit,{'id': msg.data[0].emp_id});
              $scope.employeeDeliverySalesPersonnelEdit.splice(indexEdit,1);
            }

            if($scope.employeeDeliverySalesPersonnel.length === 0){
              $scope.noDSP = true;
            }
          break;
          case "Delivery Helper":
            index = _.findIndex($scope.employeeDeliveryHelper,{'id': msg.data[0].emp_id});
            console.log(index);
            $scope.employeeDeliveryHelper.splice(index,1);
            $scope.employeeDeliveryHelper = $scope.sortData($scope.employeeDeliveryHelper,'emp_fname');
            $scope.truck.helper = $scope.employeeDeliveryHelper[0];
           // $scope.truckEdit.helper = $scope.employeeDeliveryHelper[0];
            if($scope.employeeDeliveryHelperEdit.length !== 0){
              indexEdit = _.findIndex($scope.employeeDeliveryHelperEdit,{'id':  msg.data[0].emp_id});
              $scope.employeeDeliveryHelperEdit.splice(indexEdit,1);
            }

            if($scope.employeeDeliveryHelper.length === 0){
              $scope.noDH = true;
            }
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
        $scope.routesEdit.push(msg.data);
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
        var index = _.findIndex($scope.routes,{'id': msg.data.route_id});
        console.log(index);
        $scope.routes.splice(index,1);

        if($scope.routesEdit.length !== 0){
          var indexEdit = _.findIndex($scope.routesEdit,{'id': msg.data.route_id});
          console.log(indexEdit);
          $scope.routesEdit.splice(indexEdit,1);
        }

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


