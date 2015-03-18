'use strict';

angular.module('fmApp')
.controller('LoginCtrl',['$scope', 'authService', '$state', 'userService', function($scope, authService, $state, userService){
	$scope.error = "";
	$scope.showError = false;
    
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

        if(status.code === 1) {
          var userInfo = data.userinfo
          userService.setUser(userInfo);
          authService.setToken(data.token);

          switch(userInfo.type) {
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
        }else{
          $scope.error = status.message;
	        $scope.showError = true;
        }

	  }).error(function (error) {
        console.log("Error login :" + error);
	  })

	}
}]);
