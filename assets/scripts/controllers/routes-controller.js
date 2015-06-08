'use strict';

angular.module('fmApp')
.controller('RoutesCtrl',['$scope', '_', '$http', 'httpHost','authService', '$modal', function($scope, _, $http, httpHost, authService, $modal){
  $scope.days = ['monday','tuesday','wednesday','thursday','friday','saturday'];
  $scope.addresses = [];
  $scope.addressAvailableList = [];
  $scope.addressesAvailable = [];
  $scope.addressAvailableListEdit = [];
  $scope.routes = [];

  $scope.editState = false;
  $scope.deleteState = false;

  $scope.addAddressForm = false;
  $scope.editAddressForm = false;
  $scope.addRouteBox = false;
  $scope.editRouteBox = false;


  $scope.editIndex = -1;

  $scope.noAddresses = false;
  $scope.noRoutes = false;
  $scope.noAddressesAvailable = false;


  $scope.address = {};
  $scope.address.days = [];
  $scope.addressEdit = {};
  $scope.addressEdit.days = [];
  $scope.copiedAddress = {};

  $scope.route = {};
  $scope.route.address = [];
  $scope.route.flag = "add";

  $scope.mondayButton = false;
  $scope.tuesdayButton = false;
  $scope.wednesdayButton = false;
  $scope.thursdayButton = false;
  $scope.fridayButton = false;
  $scope.saturdayButton = false;

  $scope.mondayButtonEdit = false;
  $scope.tuesdayButtonEdit = false;
  $scope.wednesdayButtonEdit = false;
  $scope.thursdayButtonEdit = false;
  $scope.fridayButtonEdit = false;
  $scope.saturdayButtonEdit = false;

  $scope.existingAddressInRouteError = false; 
  $scope.existingAddressInRoute = ''; 

  $scope.sortCriteria = 'id';


  var getAdresses = function () {
    $http.get(httpHost + '/address').success( function (data) {
      if(data.length !== 0){
        $scope.addresses = data;    
        console.log("Addresses:");
        console.log($scope.addresses);
      }else{
        $scope.noAddresses = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  var getAdressesAvailable = function () {
    $http.get(httpHost + '/address/list').success( function (data) {
      if(data.length !== 0){
        $scope.addressesAvailable = $scope.sortData(data,'address_name');
        $scope.addressAvailableList = $scope.addressesAvailable[0];
        $scope.addressAvailableListEdit = $scope.addressesAvailable[0];
        console.log("Addresses Available:");
        console.log($scope.addressesAvailable);
      }else{
        $scope.noAddressesAvailable = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  var getRoutes= function () {
    $http.get(httpHost + '/routes').success( function (data) {
       if(data.length !== 0){
        $scope.routes = data;
        console.log("Routes:");
        console.log($scope.routes);
      }else{
        $scope.noRoutes = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  getAdresses();
  getAdressesAvailable();
  getRoutes();

  $scope.pagePrint = function () {
    window.print();
  };

  $scope.showAddAddressForm = function (data) {
    if($scope.editAddressForm === true) {
       $scope.showEditAddressForm(false);
    }

    $scope.addAddressForm = data;
    if(data === false){
      $scope.address.address_name = '';
      $scope.address.days = [];
      $scope.mondayButton = false;
      $scope.tuesdayButton = false;
      $scope.wednesdayButton = false;
      $scope.thursdayButton = false;
      $scope.fridayButton = false;
      $scope.saturdayButton = false;

    }
  };

  $scope.showEditAddressForm = function (data) {
    if($scope.addAddressForm === true){
      $scope.showAddAdressForm(false);
    }
    $scope.editAddressForm = data;
    
    if(data === false){
      $scope.mondayButtonEdit = false;
      $scope.tuesdayButtonEdit = false;
      $scope.wednesdayButtonEdit = false;
      $scope.thursdayButtonEdit = false;
      $scope.fridayButtonEdit = false;
      $scope.saturdayButtonEdit = false;
    }
  };

  $scope.showAddRouteBox = function (data){
    if($scope.editIndex !== -1){
      $scope.editIndex = -1;
    }
    $scope.addRouteBox = data;
    if(data === false){
      $scope.route.route_name = '';
      if($scope.route.address.length !== 0){
        for (var i = 0; i < $scope.route.address.length; i++) {
          $scope.addressesAvailable.push($scope.route.address[i]);
        }
        $scope.route.address= [];
        $scope.addressesAvailable = $scope.sortData($scope.addressesAvailable,'address_name');
        $scope.addressAvailableList = $scope.addressesAvailable[0];
        $scope.noAddressesAvailable = false;
      }
    }
  };

  $scope.addressEditClicked = function (address) {
    $scope.showEditAddressForm(true);
    $scope.copiedAddress = angular.copy(address);
    console.log($scope.copiedAddress);
    $scope.addressEdit.id = $scope.copiedAddress.id;
    $scope.addressEdit.address_name = $scope.copiedAddress.address_name;
    $scope.addressEdit.days = $scope.copiedAddress.days.split(",");
    console.log($scope.addressEdit);
    // $scope.addressEdit.days.every(function (day) {
    //   console.log(day);
    // });
    for (var i = 0 ; i < $scope.addressEdit.days.length ; i++) {
      console.log($scope.addressEdit.days[i]);
      switch($scope.addressEdit.days[i]){
        case 'monday':
        $scope.mondayButtonEdit = true;
        break;
        case 'tuesday':
        $scope.tuesdayButtonEdit = true;
        break;
        case 'wednesday':
        $scope.wednesdayButtonEdit = true;
        break;
        case 'thursday':
        $scope.thursdayButtonEdit = true;
        break;
        case 'friday':
        $scope.fridayButtonEdit = true;
        break;
        case 'saturday':
        $scope.saturdayButtonEdit = true;
      }
    };
    
  };

  $scope.addAddress = function (address) {
    console.log(address);
    io.socket.request($scope.socketOptions('post','/address',{"Authorization": "Bearer " + authService.getToken()},address), function (body, JWR) {
      console.log('Sails responded with post user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
        $scope.showAddAddressForm(false);
        $scope.$digest();
      }
    });  
  };

  $scope.editAddress = function (address) {
    console.log("EDIT BUTTON CLICKED!!");
    io.socket.request($scope.socketOptions('put','/address/edit',{"Authorization": "Bearer " + authService.getToken()},{"address": address}), function (body, JWR) {
      console.log('Sails responded with edit employee: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.showEditAddressForm(false);
        $scope.$digest(); 
      }
    });
    console.log(address);
  };

  $scope.deleteAddress = function (address){
    console.log(address.id);
    io.socket.request($scope.socketOptions('delete','/address/' + address.id,{"Authorization": "Bearer " + authService.getToken()}), function (body, JWR) {
      console.log('Sails responded with delete employee: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){ 
      }
    }); 
  };

  $scope.addRoute = function (route) {
    console.log(route);
    // io.socket.request($scope.socketOptions('post','/routes',{"Authorization": "Bearer " + authService.getToken()},route), function (body, JWR) {
    //   console.log('Sails responded with post user: ', body);
    //   console.log('and with status code: ', JWR.statusCode);
    //   if(JWR.statusCode === 201){
    //     $scope.showAddRouteBox(false);
    //     $scope.$digest();
    //   }
    // });
    io.socket.request($scope.socketOptions('post','/routes/add',{"Authorization": "Bearer " + authService.getToken()},route), function (body, JWR) {
      console.log('Sails responded with put address: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
         $scope.route.address= [];
         $scope.showAddRouteBox(false);
         $scope.$digest();
      }
    }); 
  };

  $scope.setEditRoute = function (index){
     if($scope.addRouteBox === true){
       $scope.showAddRouteBox(false);
     }
     $scope.editIndex = index;
  };

  $scope.deleteRoute = function (route) {
    io.socket.request($scope.socketOptions('delete','/routes/remove?id=' + route.id,{"Authorization": "Bearer " + authService.getToken()}), function (body, JWR) {
      console.log('Sails responded with delete product: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        console.log("Delete LoadOut");
        $scope.$digest();
      }
    });
  }; 


  
  $scope.addDay = function (day) {
    console.log(day);
    console.log($scope.mondayButton);
    switch(day){
      case 'monday':
        console.log("Monday");
        if($scope.mondayButton === true){
          $scope.address.days.push(day);
          $scope.mondayButton = true;
          console.log("scope True");
        }else{
          var index = _.indexOf($scope.address.days,day);
          $scope.address.days.splice(index,1);
          $scope.mondayButton = false;
          console.log("scope false");
        }
        break;
      case 'tuesday':
         console.log("Tuesday");
        if($scope.tuesdayButton === true){
          $scope.address.days.push(day);
          $scope.tuesdayButton = true;
        }else{
          var index = _.indexOf($scope.address.days,day);
          $scope.address.days.splice(index,1);
          $scope.tuesdayButton = false;
        }
        break;
      case 'wednesday':
        console.log("Wednesday");
        if($scope.wednesdayButton === true){
          $scope.address.days.push(day);
          $scope.wednesdayButton = true;
        }else{
          var index = _.indexOf($scope.address.days,day);
          $scope.address.days.splice(index,1);
          $scope.wednesdayButton = false;
        }
        break;
      case 'thursday':
        console.log("Thursday");
        if($scope.thursdayButton === true){
          $scope.address.days.push(day);
          $scope.thursdayButton = true;
        }else{
          var index = _.indexOf($scope.address.days,day);
          $scope.address.days.splice(index,1);
          $scope.thursdayButton = false;
        }
        break;
      case 'friday':
        console.log("Friday");
        if($scope.fridayButton === true){
          $scope.address.days.push(day);
          $scope.fridayButton = true;
        }else{
          var index = _.indexOf($scope.address.days,day);
          $scope.address.days.splice(index,1);
          $scope.fridayButton = false;
        }
        break;
      case 'saturday':
        console.log("Saturday");
        if($scope.saturdayButton === true){
          $scope.address.days.push(day);
          $scope.saturdayButton = true;
        }else{
          var index = _.indexOf($scope.address.days,day);
          $scope.address.days.splice(index,1);
          $scope.saturdayButton = false;
        }
    }

  };

  $scope.editDay = function (day) {
    // $scope.addressEdit.days.push(day);
    switch(day){
      case 'monday':
        if($scope.mondayButtonEdit === true){
          $scope.addressEdit.days.push(day);
          $scope.mondayButtonEdit = true;
        }else{
          var index = _.indexOf($scope.addressEdit.days,day);
          $scope.addressEdit.days.splice(index,1);
          $scope.mondayButtonEdit = false;
        }
        break;
      case 'tuesday':
        if($scope.tuesdayButtonEdit === true){
          $scope.addressEdit.days.push(day);
          $scope.tuesdayButtonEdit = true;
        }else{
          var index = _.indexOf($scope.addressEdit.days,day);
          $scope.addressEdit.days.splice(index,1);
          $scope.tuesdayButtonEdit = false;
        }
        break;
      case 'wednesday':
        if($scope.wednesdayButtonEdit === true){
          $scope.addressEdit.days.push(day);
          $scope.wednesdayButtonEdit = true;
        }else{
          var index = _.indexOf($scope.addressEdit.days,day);
          $scope.addressEdit.days.splice(index,1);
          $scope.wednesdayButtonEdit = false;
        }
        break;
      case 'thursday':
        if($scope.thursdayButtonEdit === true){
          $scope.addressEdit.days.push(day);
          $scope.thursdayButtonEdit = true;
        }else{
          var index = _.indexOf($scope.addressEdit.days,day);
          $scope.addressEdit.days.splice(index,1);
          $scope.thursdayButtonEdit = false;
        }
        break;
      case 'friday':
        if($scope.fridayButtonEdit === true){
          $scope.addressEdit.days.push(day);
          $scope.fridayButtonEdit = true;
        }else{
          var index = _.indexOf($scope.addressEdit.days,day);
          $scope.addressEdit.days.splice(index,1);
          $scope.fridayButtonEdit = false;
        }
        break;
      case 'saturday':
        if($scope.saturdayButtonEdit === true){
         $scope.addressEdit.days.push(day);
          $scope.saturdayButtonEdit = true;
        }else{
          var index = _.indexOf($scope.addressEdit.days,day);
          $scope.addressEdit.days.splice(index,1);
          $scope.saturdayButtonEdit = false;
        }
    }

  };

  $scope.addAvaiableAddress = function (data, evt, index){
    console.log("Dropped");
    console.log(data);
    console.log($scope.route.address);

    console.log("Find Index");
    var index = _.findIndex( $scope.addressesAvailable,{'id': data.id});
    console.log(index);
    
    console.log("Splice");
    $scope.addressesAvailable.splice(index,1);
    $scope.addressAvailableList  =  $scope.addressesAvailable[0];
    $scope.addressAvailableListEdit =  $scope.addressesAvailable[0];
    $scope.route.address.push(data);

     if($scope.addressesAvailable.length === 0){
      $scope.noAddressesAvailable = true;
    }

  };

  $scope.addAvaiableAddressEdit = function (data, routeIndex, name){
    console.log("Dropped");
    console.log(data);
    console.log(name);
    
    console.log("Find Index");
     var index = _.findIndex( $scope.addressesAvailable,{'id': data.id});
    // console.log(index);
    
    console.log("Splice");
    $scope.addressesAvailable.splice(index,1);

    var currentAddress = [];
    console.log(currentAddress);
    currentAddress.push(data);

    // $scope.addressesAvailable = $scope.sortData(data,'address_name');
    $scope.addressAvailableList  =  $scope.addressesAvailable[0];
    $scope.addressAvailableListEdit =  $scope.addressesAvailable[0];

    var newAddress = {
    "route_name": name,
    "address": currentAddress,
    "flag": "edit"
    };
    console.log(newAddress);
    io.socket.request($scope.socketOptions('post','/routes/add',{"Authorization": "Bearer " + authService.getToken()},newAddress), function (body, JWR) {
      console.log('Sails responded with put address: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
         console.log("Added Address");
         $scope.$digest();
      }
    }); 
  };

  $scope.deleteAvailableAddress = function (address) {
    console.log("Find Index");
    var index = _.findIndex($scope.route.address,{'id': address.id});
    console.log(index);

    console.log("Splice");
    $scope.route.address.splice(index,1);
    $scope.addressesAvailable.push(address);
    $scope.addressesAvailable = $scope.sortData($scope.addressesAvailable,'address_name');
    $scope.addressAvailableList = $scope.addressesAvailable[0];
    if($scope.noAddressesAvailable === true){
      $scope.noAddressesAvailable = false;
    }
  };

  $scope.deleteAddressInRoute = function (route,address) {
    
    var addressInfo = {
    "route": route,
    "address": address.id
    };

    console.log(address);

    io.socket.request($scope.socketOptions('post','/address/remove',{"Authorization": "Bearer " + authService.getToken()},addressInfo), function (body, JWR) {
      console.log('Sails responded with put address: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
         console.log("Deleted Address");
         $scope.$digest();
      }
    }); 

  };

  $scope.showExistingAddressInRouteError = function (data,address) {
    $scope.existingAddressInRouteError = data;

    if(data === true){
      $scope.existingAddressInRoute = address + " is already added.";
    }else{
      $scope.existingAddressInRoute = '';
    }

  };

  io.socket.on('address', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);

    switch (msg.verb) {
      case "created": 
        console.log("Address Created");
        $scope.addresses.push(msg.data);
        $scope.addressesAvailable.push(msg.data);
        $scope.addressesAvailable = $scope.sortData($scope.addressesAvailable,'address_name');
        $scope.addressAvailableList = $scope.addressesAvailable[0];
        $scope.addressAvailableListEdit = $scope.addressesAvailable[0];
         if($scope.noAddresses === true){
          $scope.noAddresses = false;
        } 
        if($scope.noAddressesAvailable === true){
          $scope.noAddressesAvailable = false;
        }
        $scope.$digest();
        break;
      case "updated": 
        console.log("Address Updated");
        var index = _.findIndex($scope.addresses,{'id': msg.data[0].id});
        console.log(index);
        $scope.addresses[index] = msg.data[0];   
        console.log(msg.data);
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Address Deleted");
        console.log(msg.data[0]);
        var index = _.findIndex($scope.addresses,{'id': msg.data[0].address_id});
        console.log(index);
        $scope.addresses.splice(index,1);
        if($scope.addresses.length === 0){
          $scope.noAddresses = true;
        }
        $scope.$digest();
        break;
      case "removed":
        console.log("Address Removed");
       // console.log(msg.data.route);
        //console.log(msg.data.address.id);
        var routeIndex =  _.findIndex($scope.routes,{'id': msg.data.route});
        console.log(routeIndex);
        console.log($scope.routes[routeIndex]);
        var addressIndex =  _.findIndex($scope.routes[routeIndex].address,{'id': msg.data.address[0].id});
        console.log(addressIndex);
        $scope.routes[routeIndex].address.splice(addressIndex,1);
        $scope.addressesAvailable.push(msg.data.address[0]);
        $scope.addressesAvailable = $scope.sortData($scope.addressesAvailable,'address_name');
        $scope.addressAvailableList = $scope.addressesAvailable[0];
        $scope.addressAvailableListEdit = $scope.addressesAvailable[0];
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
        console.log($scope.routes);
        if($scope.noRoutes === true){
          $scope.noRoutes = false;
        }
        $scope.$digest();
        break;
      case "updated": 
        console.log("Route Updated");
        var index = _.findIndex($scope.routes,{'id': msg.data.id});
        console.log(index);
        $scope.routes[index] = msg.data;   
        console.log(msg.data);
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Route Deleted");
        var index = _.findIndex($scope.routes,{'id': msg.data.id});
        console.log(index);
        $scope.routes.splice(index,1);
        if($scope.routes.length === 0){
          $scope.noRoutes = true;
        }
        $scope.$digest();
    }

  });
 $scope.open = function (address) {
    console.log("Open Modal");

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'addressModalDelete.html',
      controller: 'AddressModalCtrl',
      resolve: {
        address: function () {
          return address;
        }
      }
    });

    modalInstance.result.then(function (address) {
      $scope.deleteAddress(address);
    }, function () {
      console.log("close");
    });

  };


 $scope.openRoute = function (routeInfo) {
    console.log("Open Modal");

    var routeModalInstance = $modal.open({
      animation: true,
      templateUrl: 'routesModalDelete.html',
      controller: 'RoutesModalCtrl',
      resolve: {
        routeInfo: function () {
          return routeInfo;
        }
      }
    });

    routeModalInstance.result.then(function (routeInfo) {
      $scope.deleteRoute(routeInfo);
    }, function () {
      console.log("close");
    });

  };

}])

.controller('AddressModalCtrl', function ($scope, $modalInstance, address) {

  $scope.ok = function () {
    $modalInstance.close(address);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})

.controller('RoutesModalCtrl', function ($scope, $modalInstance, routeInfo) {

  $scope.ok = function () {
    $modalInstance.close(routeInfo);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});





