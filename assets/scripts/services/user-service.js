'use strict';

angular.module('fmApp')

.factory('userService',['$http', '$window', '$log', function ($http, $window, $log) {
	var userAccess = 0;

	return {
	  setUser : function (userInfo) {
      $window.localStorage.setItem('ui',JSON.stringify(userInfo));
      this.setAccessLevel(userInfo);
	  	$log.debug(userAccess);
	  },

	  getUser : function () {
	  	return $window.localStorage.getItem('ui');
	  },
      
    setAccessLevel: function (userInfo) {
      switch (userInfo.type) {
          case 'admin':
             userAccess = 1;
             break;
          case 'encoder':
             userAccess = 2;
             break;
          case 'cashier':
            userAccess = 3;
             break;
          case 'checker':
             userAccess = 4;
             break;
          default :
             userAccess = 0;
      }
      $log.debug(userAccess);
    },

	  getAccessLevel: function () {
	  	return userAccess;
	  },

    removeAccessLevel: function () {
      userAccess = 0;
    }
	}
}]);
  