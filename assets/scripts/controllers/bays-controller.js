'use strict';

angular.module('fmApp')
.controller('BaysCtrl',['$scope','$sailsSocket','_', function($scope, $sailsSocket, _){
  $scope.bays = [];

  $scope.bay = {};
  $scope.bayEdit = {};
  $scope.bayDelete = {};
  $scope.copiedBay = {};

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
    io.socket.request($scope.socketOptions('get','/bays'), function (body, JWR) {
      console.log('Sails responded with get bay: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.bays = body;
        $scope.$digest();
      }
    });
  };

  getBays();

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
        $scope.bayEdit.pile_name = $scope.copiedBay.pile_name;
      } 
  };
    
    $scope.bayClicked = function (user) {
      if($scope.addBayForm === true){
        $scope.showAddBayForm(false);
      }
      $scope.copiedBay = angular.copy(user);
      $scope.bayEdit.id = $scope.copiedBay.id;
      $scope.bayEdit.pile_name = $scope.copiedBay.pile_name;
     
      $scope.bayDelete.id = $scope.copiedBay.id;
      $scope.bayDelete.pile_name = $scope.copiedBay.pile_name;

      $scope.showEditOrDeleteBayForm(true);
    };

    var clearForm = function () {
      $scope.bay.pile_name = '';
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
    io.socket.request($scope.socketOptions('post','/bays',{},bay), function (body, JWR) {
      console.log('Sails responded with post bay: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
        $scope.bays.push(body);
        $scope.showAddBayForm(false);
        clearForm()
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
    io.socket.request($scope.socketOptions('put','/bays/' + newInfo.id,{},newInfo), function (body, JWR) {
      console.log('Sails responded with edit bay: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        
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
    io.socket.request($scope.socketOptions('delete','/bays/' + bay.id,{}), function (body, JWR) {
      console.log('Sails responded with delete bay: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        
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
        $scope.bays.push(msg.data);
        $scope.showAddBayForm(false);
        clearForm()
        $scope.$digest();
        break;
      case "updated":
        console.log("Bay Updated");
        var index = _.findIndex($scope.bays,{'id': msg.data.id});
        console.log($scope.bays);
        console.log(index);
        $scope.bays[index] = msg.data;
        $scope.showEditOrDeleteBayForm(false);
        $scope.$digest();
        break
      case "destroyed":
        console.log("Bay Deleted");
        var index = _.findIndex($scope.bays,{'id': msg.data.id});
        $scope.bays.splice(index,1);
        $scope.showEditOrDeleteBayForm(false);
        $scope.$digest();
    }

  });

}]);
