'use strict';

angular.module('fmApp')
.controller('BaysCtrl',['$scope','_','$http', 'httpHost', 'authService', function($scope, _, $http, httpHost, authService){
  $scope.bays = [];
  $scope.bayItems = [];
  $scope.products = [];
  $scope.existingCompany = [];

  $scope.bay = {};
  $scope.bayEdit = {};
  $scope.bayDelete = {};
  $scope.copiedBay = {};

  $scope.noBays = true;

  $scope.addBayForm = false;
  $scope.editOrDeleteBayForm = false;
  $scope.editBayTab = true;

  var getBays = function () {
      // $sailsSocket.get('/bays').success(function (data) {
      // $scope.bays = data;
      // console.log($scope.bays);
      // }).error(function (err) {
      // console.log(err);
      // });
    // io.socket.request($scope.socketOptions('get','/bays'), function (body, JWR) {
    //   console.log('Sails responded with get bay: ', body);
    //   console.log('and with status code: ', JWR.statusCode);
    //   if(JWR.statusCode === 200){
    //     $scope.bays = body;
    //     $scope.$digest();
    //   }
    // });

    $http.get(httpHost + '/bays').success( function (data) {
      if(data.length !== 0){
      $scope.bays = data;
      console.log("Bays:");
      console.log($scope.bays);
      $scope.noBays = false;
      }
    }).error(function (err) {
      console.log(err);
    });

  };


  var getBayItems = function () {
    // io.socket.request($scope.socketOptions('get','/bays/bayitems'), function (body, JWR) {
    //     console.log('Sails responded with get bay items: ', body);
    //     console.log('and with status code: ', JWR.statusCode);
    //     if(JWR.statusCode === 200){
    //       $scope.bayItems = body;
    //       $scope.$digest();
    //     }
    // });

    $http.get(httpHost + '/bays/bayitems').success( function (data) {
      if(data.length !== 0){
      $scope.bayItems = data;
      console.log("Bay items:");
      console.log($scope.bayItems);
      $scope.noBays = false;
      }
    }).error(function (err) {
      console.log(err);
    });

  };

  getBays();
  getBayItems();

  $scope.showAddBayForm = function (data) {
      $scope.addBayForm = data;
      if($scope.editOrDeleteBayForm === true) {
        $scope.showEditOrDeleteBayForm(false);
      }
      if(data === false){
        clearForm();
      }
  };

  $scope.showEditOrDeleteBayForm = function (data) {
      $scope.editOrDeleteBayForm = data;
  };

  $scope.setEditBayTab = function (data) {
      $scope.editBayTab = data;
      if(data === true){
        $scope.bayEdit.bay_name = $scope.copiedBay.bay_name;
        $scope.bayEdit.bay_label = $scope.copiedBay.bay_label;
      } 
  };
    
  $scope.bayClicked = function (user) {
      if($scope.addBayForm === true){
        $scope.showAddBayForm(false);
      }
      $scope.copiedBay = angular.copy(user);
      $scope.bayEdit.id = $scope.copiedBay.id;
      $scope.bayEdit.bay_name = $scope.copiedBay.bay_name;
      $scope.bayEdit.bay_label = $scope.copiedBay.bay_label;
      $scope.bayEdit.bay_limit = $scope.copiedBay.bay_limit;
     
      $scope.bayDelete.id = $scope.copiedBay.id;
      $scope.bayDelete.bay_name = $scope.copiedBay.bay_name;
      $scope.bayDelete.bay_label = $scope.copiedBay.bay_label;
      $scope.bayDelete.bay_limit = $scope.copiedBay.bay_limit;

      $scope.showEditOrDeleteBayForm(true);
  };

  var clearForm = function () {
    $scope.bayForm.$setPristine();
    $scope.bay.bay_name = '';
    $scope.bay.bay_label = '';
    $scope.bay.bay_limit = '';
  }; 
  
  $scope.getBayCount = function (index) {
    console.log(index);
    if($scope.bayItems.length !== 0){
    var itemIndex = _.findIndex($scope.bayItems, { 'bay_id':index});
    console.log(itemIndex);
    return $scope.bayItems[itemIndex].total_products; 
    }else{
      return '';
    }
    
  };

  $scope.addBay = function (bay) {
      // $sailsSocket.post('/bays', bay).success(function (data) {
      // console.log(data);
      // $scope.bays.push(data);
      // $scope.showAddBayForm(false);
      // clearForm();
      // }).error(function (err) {
      // console.log(err);
      // });
    console.log(bay);
    io.socket.request($scope.socketOptions('post','/bays/add',{"Authorization": "Bearer " + authService.getToken()},bay), function (body, JWR) {
      console.log('Sails responded with post bay: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
        // $scope.bays.push(body);
        $scope.showAddBayForm(false);
        clearForm();
        $scope.$digest();
      }
    }); 
  }; 

  $scope.editBay = function (newInfo) {
      // console.log(newInfo);
      // $sailsSocket.put('/bays/' + newInfo.id, newInfo).success(function (data) {
        // var index = _.findIndex($scope.bays, function(bay) { return bay.id == data.id; });
        // $scope.bays[index] = data;
        // $scope.showEditOrDeleteBayForm(false);
      // }).error(function (err) {
      //   console.log(err);
      // });
    io.socket.request($scope.socketOptions('put','/bays/' + newInfo.id,{"Authorization": "Bearer " + authService.getToken()},newInfo), function (body, JWR) {
      console.log('Sails responded with edit bay: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
         $scope.showEditOrDeleteBayForm(false);
      }
    });
  };

  $scope.deleteBay = function (bay) {
      // $sailsSocket.delete('/bays/' + user.id).success(function (data) {
      //   var index = _.findIndex($scope.bays, function(bay) { return bay.id == data.id; });
      //   $scope.bays.splice(index,1);
      //   $scope.showEditOrDeleteBayForm(false);
      // }).error(function (err) {
      //   console.log(err);
      // });
    io.socket.request($scope.socketOptions('delete','/bays/' + bay.id,{"Authorization": "Bearer " + authService.getToken()}), function (body, JWR) {
      console.log('Sails responded with delete bay: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.showEditOrDeleteBayForm(false);
      }
    });
  };

  io.socket.on('bays', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);
    
    switch (msg.verb) {
      case "created": 
        console.log("Bay Created");
        if($scope.noBays === true){
          $scope.noBays = false;
        }
        console.log(msg);
        $scope.bays.push(msg.data);
        $scope.bayItems.push(msg.bayitem);
        $scope.showAddBayForm(false);
        clearForm()
        $scope.$digest();
        break;
      case "updated":
        console.log("Bay Updated");
        var index = _.findIndex($scope.bays,{'id': msg.data.id});
        console.log(index);
        $scope.bays[index] = msg.data;
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Bay Deleted");
        console.log(msg.data[0]);
        var index = _.findIndex($scope.bays,{'id': msg.data[0].bay_id});
        $scope.bays.splice(index,1);
        if($scope.bays.length === 0){
          $scope.noBays = true;
        }
        $scope.$digest();
    }

  });



}]);
