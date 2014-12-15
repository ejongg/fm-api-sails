'use strict';

/**
 * @ngdoc function
 * @name itprojApp.controller:EncoderHomeCtrl
 * @description
 * # EncoderHomeCtrl
 * Controller of the itprojApp
 */
angular.module('itprojApp')
  .controller('EncoderHomeCtrl', ['$scope', 'userService','productService',function ($scope, userService, productService) {
  	$scope.username = userService.getUser().user;
  	$scope.variants = {};
    $scope.products = {};
    $scope.addForm = false;
    $scope.selectedProduct = {};
    $scope.selectedReplenishProduct = {};

  
    $scope.variants = productService.getVariants();
    $scope.products = productService.getProducts();
    console.log($scope.products);


   $scope.showAddProduct = function () {
   	  $scope.addForm = true;
   };

   $scope.cancelAddProduct = function () {
   	  $scope.addForm = false;
   	  $scope.addProduct = {};
   };

   $scope.addProductEntered = function (product) {
     productService.addProduct('/fm-api/products/add',product).success(function (data){
       $scope.products.push(data);
     });
     $scope.addForm = false;
   };

   $scope.transferProduct = function (product) {
       $scope.selectedProduct = product;
       console.log(product);
   };

   $scope.transferReplenishProduct = function (product) {
       $scope.selectedReplenishProduct = product;
       console.log(product);
   };

   $scope.addProductVariant = function (product) {
   	console.log(product);
   	$scope.selectedProduct = {};
   	$('#addVariantModal').modal('hide');
     productService.addVariant('/fm-api/products/add/variant',product).success(function (data){
      console.log(data);
       if(data !== ''){
          $scope.variants.push(data);
       }else {
         //put a warning message
       }

     });
   };

   $scope.replenishProductEntered = function (product) {
     console.log(product);
     $scope.selectedReplenishProduct = {};
     $('#replenishModal').modal('hide');
     var param = {
      'id' : product.id,
      'prod_Id' : product.prod_Id,
      'size' : product.size,
      'bottles' : product.bottles,
      'cases' : product.cases,
      'expiration' : product.expiration
     };
     console.log(param);
     productService.replenish('/fm-api/products/replenish', param).success( function (data) {
     console.log(data);
     });
   };
    


  }]);
