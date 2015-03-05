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
      $sailsSocket.get('/bays').success(function (data) {
      $scope.bays = data;
      console.log($scope.bays);
      }).error(function (err) {
      console.log(err);
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
      $sailsSocket.post('/bays', bay).success(function (data) {
      console.log(data);
      $scope.bays.push(data);
      $scope.showAddBayForm(false);
      clearForm();
      }).error(function (err) {
      console.log(err);
      });
  }; 

  $scope.editBay = function (newInfo) {
      console.log(newInfo);
      $sailsSocket.put('/bays/' + newInfo.id, newInfo).success(function (data) {
        var index = _.findIndex($scope.bays, function(bay) { return bay.id == data.id; });
        $scope.bays[index] = data;
        $scope.showEditOrDeleteBayForm(false);
      }).error(function (err) {
        console.log(err);
      });
  };

  $scope.deleteBay = function (user) {
      $sailsSocket.delete('/bays/' + user.id).success(function (data) {
        var index = _.findIndex($scope.bays, function(bay) { return bay.id == data.id; });
        $scope.bays.splice(index,1);
        $scope.showEditOrDeleteBayForm(false);
      }).error(function (err) {
        console.log(err);
      });
  };
}]);
