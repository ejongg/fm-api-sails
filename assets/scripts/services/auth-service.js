'use strict';

angular.module('fmApp')

.factory('authService',['$http', '$window','httpHost','$log', function ($http, $window, httpHost,$log) {

    return {
      setToken: function (token) {
        $window.localStorage.setItem('auth_token',token);
      },
      getToken: function () {
        return $window.localStorage.getItem('auth_token');
      },
      login: function (uri, params) {
      	return $http.post(httpHost + uri, params);
      },
      logout: function () {
      	$window.localStorage.removeItem('auth_token');
        // $window.localStorage.removeItem('ui');
        // userService.removeAccessLevel();
      }

    }
}])

.factory('authInterceptor',['$rootScope', '$q', '$injector', function ($rootScope, $q, $injector) {
  return {
    request: function (config) {
      var authService = $injector.get('authService');
      config.headers = config.headers || {};
      if (authService.getToken()) {
        config.headers.Authorization = 'Bearer ' + authService.getToken();
      }
      return config;
    },
    response: function (response) {
     
      if (response.status === 401) {
        // handle the case where the user is not authenticated
      }
      return response || $q.when(response);
    }
  };
}])

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});
  
  