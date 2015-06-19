'use strict';

angular.module('fmApp')

.service('userService',['authService','$window', '$log', 'jwtHelper','$http','$rootScope','httpHost','$state','$q', 
  function (authService, $window, $log, jwtHelper,$http,$rootScope,httpHost,$state,$q) {
	var userAccess = 0;
  var token = '';
  var user = {};
  var userID = null;

  var removeLevel = function (){
    userAccess = 0;
  }

  console.log("User Service");

	return {

	  getUser : function () {
      console.log("get user");
	  	token = authService.getToken();
      var deferred = $q.defer();
      if(token == null){
        // authService.logout();
        // removeLevel();
        // $state.go('login');
        deferred.reject(403);
      }else{
      userID = jwtHelper.decodeToken(token);
      console.log(token);
      console.log(userID);

      return $http.get(httpHost + '/users/' + userID).success(function (data) {
         user = data;
         switch(user.type){
          case 'admin':
            userAccess = 1;
            break;
          case 'encoder':
            userAccess = 2;
            break;
          case 'cashier':
            userAccess = 3;
         }
         console.log(userAccess);
         console.log(user);
         deferred.resolve(data);
      });
      }
      return deferred.promise;
	  },

    getAccessLevel: function () {
      return userAccess;
    },
    removeAccessLevel: function () {
     removeLevel();
    },

     getUserID : function () {
       console.log("Get ID");
      console.log(userID);
       return userID;
     },

     getUserType : function () {
       return user.type;
     },

     getFirstName : function () {
       return user.firstname;
     },

     getLastName : function () {
       return user.lastname;
     },

     getUserName : function () {
       return user.firstname + " " + user.lastname;
     },

     setUserName : function (username) {
       user.username = username;
     },
     
     setFirstName: function (firstname) {
       console.log("Edit firstname");
       user.firstname = firstname;
       $rootScope.$broadcast("firstName");
     },

     setLastName: function (lastname) {
      console.log("Edit lastname");
       user.lastname = lastname;
       $rootScope.$broadcast("lastName");
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
  