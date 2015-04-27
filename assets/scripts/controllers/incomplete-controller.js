'use strict';

angular.module('fmApp')
.controller('IncompleteCtrl',['$scope','_','$http', 'httpHost', 'authService', function($scope, _, $http, httpHost, authService){
  $scope.incompleteCases = [];
  $scope.bays = [];
  $scope.incForm = false;
  $scope.incVal = {};

  $scope.noIncomplete = false;
  $scope.noBays = false;

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

  var getBays = function () {

    $http.get(httpHost + '/bays').success( function (data) {      
      if(data.length !== 0){
        $scope.bays = data;
        $scope.incVal.bay = $scope.bays[0];
        console.log('Bays');
        console.log($scope.bays);
      }else{
         $scope.noBays = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });

  };

  getIncompleteCases();
  getBays();

   $scope.combineBay = function (bay){
    return bay.bay_name + ' ' + bay.bay_label;
  };

  $scope.showIncForm = function (data) {
    $scope.incForm = data;
    if(data === false){
      clearForm();
    }
  };

  $scope.incompleteClicked = function (inc){
    $scope.showIncForm(true);
    $scope.incVal = inc;
  };

  var clearForm = function () {
    $scope.incVal = {};
    $scope.incVal.bay = $scope.bays[0];
  };

   $scope.submit = function (inc){
    console.log(inc);
    var product = {
    "sku_id":  inc.sku_id.id,
    "cases": inc.cases,
    "bottlespercase": inc.sku_id.bottlespercase,
    "bay": inc.bay.id,
    "lifespan": inc.sku_id.lifespan,
    "exp_date": inc.exp_date 
    };

    // console.log(info);

     io.socket.request($scope.socketOptions('post','/incompletes/assemble',{"Authorization": "Bearer " + authService.getToken()},{"product": product }), function (body, JWR) {
      console.log('Sails responded with post bad order: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
        $scope.showIncForm(false);
        $scope.$digest();
      }
    }); 

  };
  
}]);
