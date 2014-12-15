'use strict';

/**
 * @ngdoc function
 * @name itprojApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the itprojApp
 */
angular.module('itprojApp')
  .controller('LoginCtrl', ['$scope', '$location', 'authService', 'userService', function ($scope, $location, authService, userService) {
    $scope.login = function (data) {
      var userData = {
        username : data.username,
        password : data.password
      };

      authService.login('/fm-api/users/login',userData).success(function (data) {
          if (data.status === 'OK') {
            userService.setUser(data);
            var loggedUser = data.user;
            
            console.log(loggedUser.type);

            switch(loggedUser.type) {
              case 'admin':
                $location.path('/admin/sales');
                break;
              case 'encoder':
                $location.path('/encoder/sales');
                break;
              case 'cashier':
                $location.path('/cashier/sales');
                break; 
              case 'checker':
                $location.path('/checker/tally');  
            }
            console.log(data);
           
          }else{
            $location.path('/');
          }
      });
    };
  }]);
