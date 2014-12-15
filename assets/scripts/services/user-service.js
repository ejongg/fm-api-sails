'use strict';

/**
 * @ngdoc service
 * @name itprojApp.userService
 * @description
 * # userService
 * Factory in the itprojApp.
 */
angular.module('itprojApp')
  .factory('userService', ['$http', 'authService', function ($http, authService) {
    // Service logic
    // ...

    var user = {};
    $http.defaults.headers.post['Content-Type'] = 'application/json';

    // Public API here
    return {
      setUser: function (data) {
        user = data;
      },
      getUser: function () {
        return user;
      },
      getAllUsers: function (uri,params) {
        return $http.get(authService.getHost() + uri, params);
      },
      addUser: function (uri,params) {
        return $http.post(authService.getHost() + uri, params);
      },
      deleteUser: function (uri,params) {
         return $http.delete(authService.getHost() + uri + params);
      },
      editUser: function (uri,params) {
         return $http.put(authService.getHost() + uri , params);
      }
    };
  }]);
