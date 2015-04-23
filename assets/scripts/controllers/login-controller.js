'use strict';

angular.module('fmApp')
.controller('LoginCtrl',['$scope', 'authService', '$state', 'userService', function($scope, authService, $state, userService){
	$scope.error = "";
	$scope.showError = false;

  if(userService.getAccessLevel() === 1){
    $state.go('admin.dssr');
  }
    
    $scope.closeError = function (option) {

      $scope.showError = option;
    }

	$scope.login = function (data) {
	  var loginData = {
       "username" : data.username,
       "password" : data.password
	  };

	 authService.login('/users/login',loginData).success(function (data) {
        var status = data.status;
         var userInfo = {};
        if(status.code === 1) {
           
          authService.setToken(data.token);
          // userService.getUser();
         userService.getUser().success(function (data) {
           switch(data.type) {
            case 'admin':
              $state.go('admin.dssr');
              break;
            case 'encoder':
              $state.go('encoder.sku');
              break;
            case 'cashier':
              $state.go('cashier.pos');
              break;
            case 'checker':
              $state.go('checker.tally');
          }
         });
         
        }else{
          $scope.error = status.message;
	        $scope.showError = true;
        }

	  }).error(function (error) {
        console.log("Error login :" + error);
	  })

	}
}]);
