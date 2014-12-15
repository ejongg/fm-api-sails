'use strict';

/**
 * @ngdoc service
 * @name itprojApp.productService
 * @description
 * # productService
 * Factory in the itprojApp.
 */
angular.module('itprojApp')
  .factory('productService',['$http','authService',function ($http, authService) {
    // Service logic
    // ...

    var variants = {};
    var products = {};

    $http.defaults.headers.post['Content-Type'] = 'application/json';
    // Public API here
    return {
      getAllVariants : function (uri, params) {
        $http.get(authService.getHost() + uri, params).success(function (data) {
        variants  = data;
        });
      },
      getVariants : function () {
        return variants;
      },
      getAllProducts : function (uri, params) {
        $http.get(authService.getHost() + uri, params).success(function (data) {
        products  = data;
        });
      },
      getProducts : function () {
        return products;
      },
      addProduct : function  (uri, params) {
        return $http.post(authService.getHost() + uri, params);
      },
      addVariant : function  (uri, params) {
        return $http.post(authService.getHost() + uri, params);
      },
      replenish : function (uri, params) {
        return $http.put(authService.getHost() + uri, params);
      }
    };
  }]);
