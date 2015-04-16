'use strict';

angular.module('fmApp')
.controller('RoutesCtrl',['$scope', '_', '$http', 'httpHost','authService', function($scope, _, $http, httpHost, authService){
	$scope.days = ['monday','tuesday','wednesday','thursday','friday','saturday'];
  $scope.addresses = [];
  $scope.routes = [];

  $scope.editState = false;
  $scope.deleteState = false;

  $scope.addAdressForm = false;
  $scope.editAdressForm = false;
  $scope.addRouteBox = false;


  $scope.address = {};
  $scope.address.days = [];
  $scope.addressEdit = {};
  $scope.addressEdit.days = [];
  $scope.copiedAddress = {};

  $scope.route = {};
  $scope.route.address = [];

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


  var getAdresses = function () {
    $http.get(httpHost + '/address').success( function (data) {
      $scope.addresses = data;
      console.log("Addresses:");
      console.log($scope.addresses);
    }).error(function (err) {
      console.log(err);
    });
  };

  var getRoutes= function () {
    $http.get(httpHost + '/routes').success( function (data) {
      $scope.routes = data;
      console.log("Routes:");
      console.log($scope.routes);
    }).error(function (err) {
      console.log(err);
    });
  };

  getAdresses();
  getRoutes();

  $scope.pagePrint = function () {
    window.print();
  };

  $scope.showAddAdressForm = function (data) {
    $scope.addAdressForm = data;
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

  $scope.showEditAdressForm = function (data) {
    $scope.editAdressForm = data;
  };

  $scope.showAddRouteBox = function (data){
    $scope.addRouteBox = data;
    if(data === false){
      $scope.route.route_name = '';
    }
  };

  $scope.addressEditClicked = function (address) {
    $scope.showEditAdressForm(true);
    $scope.copiedAddress = angular.copy(address);
    console.log($scope.copiedAddress);
    $scope.addressEdit.address_id = $scope.copiedAddress.address_id;
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
        $scope.showAddAdressForm(false);
        $scope.$digest();
      }
    });  
  };

  $scope.editAddress = function (address) {
    io.socket.request($scope.socketOptions('put','/address/' + address.address_id,{"Authorization": "Bearer " + authService.getToken()},address), function (body, JWR) {
      console.log('Sails responded with edit employee: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.showEditAdressForm(false);
        $scope.$digest(); 
      }
    });
    console.log(address);
  };

  $scope.deleteAddress = function (address){
    io.socket.request($scope.socketOptions('delete','/address/' + address.address_id,{"Authorization": "Bearer " + authService.getToken()}), function (body, JWR) {
      console.log('Sails responded with delete employee: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){ 
      }
    }); 
    console.log(address);
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
    io.socket.request($scope.socketOptions('put','/address/assign_route',{"Authorization": "Bearer " + authService.getToken()},route), function (body, JWR) {
      console.log('Sails responded with put address: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
        console.log("Ok");
      }
    }); 
  };


  
  $scope.addDay = function (day) {
    switch(day){
      case 'monday':
        if($scope.mondayButton === false){
          $scope.address.days.push(day);
          $scope.mondayButton = true;
        }else{
          var index = _.indexOf($scope.address.days,day);
          $scope.address.days.splice(index,1);
          $scope.mondayButton = false;
        }
        break;
      case 'tuesday':
        if($scope.tuesdayButton === false){
          $scope.address.days.push(day);
          $scope.tuesdayButton = true;
        }else{
          var index = _.indexOf($scope.address.days,day);
          $scope.address.days.splice(index,1);
          $scope.tuesdayButton = false;
        }
        break;
      case 'wednesday':
        if($scope.wednesdayButton === false){
          $scope.address.days.push(day);
          $scope.wednesdayButton = true;
        }else{
          var index = _.indexOf($scope.address.days,day);
          $scope.address.days.splice(index,1);
          $scope.wednesdayButton = false;
        }
        break;
      case 'thursday':
        if($scope.thursdayButton === false){
          $scope.address.days.push(day);
          $scope.thursdayButton = true;
        }else{
          var index = _.indexOf($scope.address.days,day);
          $scope.address.days.splice(index,1);
          $scope.thursdayButton = false;
        }
        break;
      case 'friday':
        if($scope.fridayButton === false){
          $scope.address.days.push(day);
          $scope.fridayButton = true;
        }else{
          var index = _.indexOf($scope.address.days,day);
          $scope.address.days.splice(index,1);
          $scope.fridayButton = false;
        }
        break;
      case 'saturday':
        if($scope.saturdayButton === false){
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
        if($scope.mondayButtonEdit === false){
          $scope.addressEdit.days.push(day);
          $scope.mondayButtonEdit = true;
        }else{
          var index = _.indexOf($scope.addressEdit.days,day);
          $scope.addressEdit.days.splice(index,1);
          $scope.mondayButtonEdit = false;
        }
        break;
      case 'tuesday':
        if($scope.tuesdayButtonEdit === false){
          $scope.addressEdit.days.push(day);
          $scope.tuesdayButtonEdit = true;
        }else{
          var index = _.indexOf($scope.addressEdit.days,day);
          $scope.addressEdit.days.splice(index,1);
          $scope.tuesdayButtonEdit = false;
        }
        break;
      case 'wednesday':
        if($scope.wednesdayButtonEdit === false){
          $scope.addressEdit.days.push(day);
          $scope.wednesdayButtonEdit = true;
        }else{
          var index = _.indexOf($scope.addressEdit.days,day);
          $scope.addressEdit.days.splice(index,1);
          $scope.wednesdayButtonEdit = false;
        }
        break;
      case 'thursday':
        if($scope.thursdayButtonEdit === false){
          $scope.addressEdit.days.push(day);
          $scope.thursdayButtonEdit = true;
        }else{
          var index = _.indexOf($scope.addressEdit.days,day);
          $scope.addressEdit.days.splice(index,1);
          $scope.thursdayButtonEdit = false;
        }
        break;
      case 'friday':
        if($scope.fridayButtonEdit === false){
          $scope.addressEdit.days.push(day);
          $scope.fridayButtonEdit = true;
        }else{
          var index = _.indexOf($scope.addressEdit.days,day);
          $scope.addressEdit.days.splice(index,1);
          $scope.fridayButtonEdit = false;
        }
        break;
      case 'saturday':
        if($scope.saturdayButtonEdit === false){
         $scope.addressEdit.days.push(day);
          $scope.saturdayButtonEdit = true;
        }else{
          var index = _.indexOf($scope.addressEdit.days,day);
          $scope.addressEdit.days.splice(index,1);
          $scope.saturdayButtonEdit = false;
        }
    }

  };

  $scope.onDropAddComplete = function (data, evt, index){
    console.log("Dropped");
    console.log(data);
    var addresses = [];
    if(_.findIndex($scope.route.address,{ 'address_id': data.address_id}) === -1 ){
      $scope.route.address.push(data);
      console.log($scope.route.address);
    }else{
      $scope.showExistingAddressInRouteError(true,data.address_name);
    }
  };

  $scope.onDropEditComplete = function (data, evt, index){
    // console.log("Dropped");
    // console.log(data);
    // var addresses = [];
    // if(_.findIndex($scope.address,{ 'address_id': data.address_id}) === -1 ){
    //   // $scope.route.address_id.push(data.address_id);
    //   // console.log($scope.route.address_id);
    //   // $scope.address.push(data);
    //   //console.log(index);
    //   addresses.push(data);
    //     var x = {
    //       "route": index,
    //       "address": addresses
    //     };

    //     console.log(x);

      // io.socket.request($scope.socketOptions('put','/address/assign_route',{"Authorization": "Bearer " + authService.getToken()},x), function (body, JWR) {
      //   console.log('Sails responded with put address: ', body);
      //   console.log('and with status code: ', JWR.statusCode);
      //   if(JWR.statusCode === 201){
      //      console.log("Ok");
      //   }
      // }); 
    // }else{
    //   // $scope.showExistingAddressInRouteError(true,data.address_name);
    // }
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
        $scope.$digest();
        break;
      case "updated": 
        console.log("Address Updated");
        var index = _.findIndex($scope.addresses,{'address_id': msg.data.address_id});
        console.log(index);
        $scope.addresses[index] = msg.data;   
        console.log(msg.data);
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Address Deleted");
        console.log(msg.data[0]);
        var index = _.findIndex($scope.addresses,{'address_id': msg.data[0].address_id});
        console.log(index);
        $scope.addresses.splice(index,1);
        $scope.$digest();
    }

  });

}]);
