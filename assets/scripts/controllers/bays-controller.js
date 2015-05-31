'use strict';

angular.module('fmApp')
.controller('BaysCtrl',['$scope','_','$http', 'httpHost', 'authService','$modal', 
  function($scope, _, $http, httpHost, authService, $modal){
  $scope.pileStatus = ["Full goods", "Moving pile"];
  $scope.bays = [];
  $scope.bayItems = [];
  $scope.products = [];

  $scope.bay = {};
  $scope.bayEdit = {};
  $scope.bayDelete = {};
  $scope.copiedBay = {};

  $scope.noBays = false;

  $scope.addBayForm = false;
  $scope.editOrDeleteBayForm = false;
  $scope.editBayTab = true;

  $scope.companies = ['Coca-Cola','SMB' ];

  $scope.errorMessage = '';
  $scope.hasError = false;


  // forSorting
  $scope.sortCriteria = 'bay_name';
  $scope.reverseSort = false;

  var getBays = function () {
    console.log("Get Bays");
    $http.get(httpHost + '/bays/list').success( function (data) {
      console.log("Bay List");
      if(data.length !== 0){
      $scope.bays = data;
      console.log("Bays:");
      console.log($scope.bays);
      }else{
        $scope.noBays = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });

  };


  /*var getBayItems = function () {
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

  };*/

  getBays();
  /*getBayItems();*/

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

  $scope.showAddBayForm = function (data) {
    $scope.bayForm.$setPristine();
    $scope.hasError = false;
      $scope.addBayForm = data;
      if($scope.editOrDeleteBayForm === true) {
        $scope.showEditOrDeleteBayForm(false);
      }
      if(data === false){
        $scope.bay.bay_name = '';
        $scope.bay.bay_label = $scope.companies[0];
        $scope.bay.bay_limit = '';
      }
  };

  $scope.showEditOrDeleteBayForm = function (data) {
      $scope.editOrDeleteBayForm = data;
       $scope.bayForm.$setPristine();
       $scope.hasError = false;
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
      console.log($scope.copiedBay);
      $scope.bayEdit.id = $scope.copiedBay.id;
      $scope.bayEdit.bay_name = $scope.copiedBay.bay_name;
      $scope.bayEdit.bay_label = $scope.copiedBay.bay_label;
      $scope.bayEdit.bay_limit = $scope.copiedBay.bay_limit;
      $scope.bayEdit.pile_status = $scope.copiedBay.pile_status;
     
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
        $scope.snackbarShow('Line Added');
      } else if (JWR.statusCode === 200){
        console.log("Error Occured");
        $scope.showErrorMessage(true,body);
      }

       $scope.$digest(); 
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
    console.log(newInfo);
    io.socket.request($scope.socketOptions('put','/bays/edit',{"Authorization": "Bearer " + authService.getToken()},newInfo), function (body, JWR) {
      console.log('Sails responded with edit bay: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
         $scope.showEditOrDeleteBayForm(false);
         $scope.snackbarShow('Line Edited');
      } else if (JWR.statusCode === 400){
        console.log("Error Occured");
        $scope.showErrorMessage(true,body);
      } else {
        console.log("Error!!!");
      }
       $scope.$digest(); 
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
        $scope.snackbarShow('Bay Deleted');
        $scope.$digest();
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
        $scope.bays.push(msg.data);
        $scope.bayItems.push(msg.bayitem);
        $scope.showAddBayForm(false);
        clearForm()
        $scope.$digest();
        break;
      case "updated":
        console.log("Bay Updated");
        console.log(msg.data.id);
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

  io.socket.on('inventory', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);
    
    switch (msg.verb) {
      case "updated":
        console.log("Bay Updated");
        getBays();
        $scope.$digest();
    }

  });

  $scope.open = function (bay) {
    console.log("Open Modal");

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'bayModalDelete.html',
      controller: 'BayModalCtrl',
      resolve: {
        bay: function () {
          return bay;
        }
      }
    });

    modalInstance.result.then(function (bay) {
      $scope.deleteBay(bay);
    }, function () {
      console.log("close");
    });

  };

}])

.controller('BayModalCtrl', function ($scope, $modalInstance, bay) {

  $scope.ok = function () {
    $modalInstance.close(bay);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

 