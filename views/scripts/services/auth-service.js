'use strict';

/**
 * @ngdoc service
 * @name itprojApp.authService
 * @description
 * # authService
 * Factory in the itprojApp.
 */
angular.module('itprojApp')
  .factory('authService', function ($http , $window) {
    // Service logic
    // ...

    var tokenKey, serviceHost, serviceToken;
    tokenKey = 'key';
    serviceHost = 'http://localhost:8080';

    $http.defaults.headers.post['Content-Type'] = 'application/json';

    // Public API here
    return {
      getHost: function () {
        return serviceHost;
      },
      setToken: function (token) {
        serviceToken = token;
        $window.localStorage.setItem(tokenKey,token);
      },
      removeToken: function () {
        serviceToken = null;
        $window.localStorage.removeItem(tokenKey);
      },
      login: function (uri, params) {
        return $http.post(serviceHost + uri, params);
      },
      logout: function (uri, params) {
        return $http.post(serviceHost + uri, params);
      }
    };

  });
