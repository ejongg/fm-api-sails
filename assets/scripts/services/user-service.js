'use strict';

angular.module('fmApp')

.factory('userService',['authService','$window', '$log', 'jwtHelper', function (authService, $window, $log, jwtHelper) {
	var userAccess = 0;
  var token = '';
  var user = {};

	return {

	  getUser : function () {
	  	token = authService.getToken();
      user = jwtHelper.decodeToken(token);
      return user
	  }
      
   //  setAccessLevel: function (userInfo) {
   //    switch (userInfo.type) {
   //        case 'admin':
   //           userAccess = 1;
   //           break;
   //        case 'encoder':
   //           userAccess = 2;
   //           break;
   //        case 'cashier':
   //          userAccess = 3;
   //           break;
   //        case 'checker':
   //           userAccess = 4;
   //           break;
   //        default :
   //           userAccess = 0;
   //    }
   //    $log.debug(userAccess);
   //  },

	  // getAccessLevel: function () {
	  // 	return userAccess;
	  // },

   //  removeAccessLevel: function () {
   //    userAccess = 0;
   //  }
	}
}]);
  