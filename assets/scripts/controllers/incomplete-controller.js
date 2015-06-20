'use strict';

angular.module('fmApp')
.controller('IncompleteCtrl',['$scope','_','$http', 'httpHost', 'authService', function($scope, _, $http, httpHost, authService){
  $scope.incompleteCases = [];
  $scope.bays = [];
  $scope.incForm = false;
  $scope.incVal = {};
  $scope.noIncomplete = false;
  $scope.noBays = false;

  $scope.errorMessage = '';
  $scope.hasError = false;

  /*for SOrting..*/
  $scope.sortCriteria='id';
  $scope.reverseSort = false;

  var getIncompleteCases = function () {

    $http.get(httpHost + '/incomplete_cases/list').success( function (data) {      
      if(data.length !== 0){
        $scope.incompleteCases = data;
        console.log('Incomplete Cases');
        console.log($scope.incompleteCases);
      }else{
         $scope.noIncomplete = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });

  };

  var getBays = function (sku) {

    $http.get(httpHost + '/bays/list/sku-lines?id=' + sku.id).success( function (data) {      
      if(data.length !== 0){
        $scope.bays = data;
        $scope.incVal.bay = $scope.bays[0];
        console.log('Bays');
        console.log($scope.bays);
        console.log($scope.incVal.bay);
      }else{
         $scope.noBays = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });

  };

  getIncompleteCases();
  // getBays();

   $scope.combineBay = function (bay){
    return bay.bay_name + ' ' + bay.bay_label;
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

  $scope.showIncForm = function (data) {
    $scope.hasError = false;
    clearForm();
    $scope.incForm = data;
    $scope.incCaseForm.$setPristine();
    $scope.hasError = false;
    if(data === false){
      clearForm();
    }
  };

  $scope.incompleteClicked = function (inc){
    console.log(inc);
    console.log(inc.sku_id.sku_name);
    $scope.incCaseForm.$setPristine();
    $scope.incVal.brand_name = inc.sku_id.sku_name;
    $scope.incVal = inc;
    // $scope.incVal.bay = $scope.bays[0];
    getBays(inc.sku_id);
    $scope.showIncForm(true);
  };

  var clearForm = function () {
    $scope.incVal.cases = '';
    $scope.incVal.bay = $scope.bays[0];
  };

   $scope.submit = function (inc){
    console.log(inc);
    var product = {
    "sku_id":  inc.sku_id.id,
    "cases": inc.cases,
    "bottlespercase": inc.sku_id.bottlespercase,
    "bay_id": inc.bay.id,
    "lifespan": inc.sku_id.lifespan,
    "exp_date": inc.exp_date 
    };

    console.log(product);

     io.socket.request($scope.socketOptions('post','/incompletes/assemble',{"Authorization": "Bearer " + authService.getToken()},{"products": product }), function (body, JWR) {
      console.log('Sails responded with post bad order: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
        $scope.showIncForm(false);
        $scope.snackbarShow('Completed case(s)');
      }else if (JWR.statusCode === 400){
        console.log("Error Occured");
        $scope.showErrorMessage(true, body.message);
      }

       $scope.$digest();
    }); 

  };

  io.socket.on('incomplete_cases', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);
    
    switch (msg.verb) {
      case "updated":
        console.log("IC Updated");
        getIncompleteCases();
        $scope.$digest();
    }

  });

  
}]);
