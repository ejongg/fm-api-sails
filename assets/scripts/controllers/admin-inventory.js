'use strict';

/**
 * @ngdoc function
 * @name itprojApp.controller:AdminInventoryCtrl
 * @description
 * # AdminInventoryCtrl
 * Controller of the itprojApp
 */
angular.module('itprojApp')
  .controller('AdminInventoryCtrl', ['$scope', 'userService', '$http', 'productService',function ($scope, userService, $http, productService) {
  	$scope.username = userService.getUser().user;
  	$scope.variants = {};
    $scope.products = {};
    $scope.showAddForm = false;
    $scope.showEditForm = false;
    $scope.showEditVariantForm = false;
    $scope.productEdit = {};
    $scope.variantEdit = {};
    $scope.tab = 1;

    $scope.inventory = 
    [
{
"id": 1,
"name": "Coke",
"size": "1L",
"price": 0,
"bottles": 6000,
"cases": 500,
"brand": "Coca-cola",
"lifespan": 0,
"expiration": "01/01/2015",
"age": 0,
"prod_Id": 1
},
{
"id": 3,
"name": "Royal",
"size": "12",
"price": 0,
"bottles": 10,
"cases": 10,
"brand": "Coca-Cola",
"lifespan": 0,
"expiration": "2015-03-12",
"age": 0,
"prod_Id": 4
},
{
"id": 4,
"name": "Royal",
"size": "12",
"price": 0,
"bottles": 10,
"cases": 10,
"brand": "Coca-Cola",
"lifespan": 0,
"expiration": "2015-03-12",
"age": 0,
"prod_Id": 4
},
{
"id": 5,
"name": "Royal",
"size": "12",
"price": 0,
"bottles": 10,
"cases": 10,
"brand": "Coca-Cola",
"lifespan": 0,
"expiration": "2015-03-12",
"age": 0,
"prod_Id": 4
},
{
"id": 6,
"name": "Royal",
"size": "12",
"price": 0,
"bottles": 10,
"cases": 10,
"brand": "Coca-Cola",
"lifespan": 0,
"expiration": "2015-03-12",
"age": 0,
"prod_Id": 4
},
{
"id": 7,
"name": "Royal",
"size": "12",
"price": 0,
"bottles": 10,
"cases": 10,
"brand": "Coca-Cola",
"lifespan": 0,
"expiration": "2015-03-12",
"age": 0,
"prod_Id": 4
},
{
"id": 8,
"name": "Royal",
"size": "12",
"price": 0,
"bottles": 10,
"cases": 10,
"brand": "Coca-Cola",
"lifespan": 0,
"expiration": "2015-03-12",
"age": 0,
"prod_Id": 4
},
{
"id": 9,
"name": "Royal",
"size": "12",
"price": 0,
"bottles": 60,
"cases": 60,
"brand": "Coca-Cola",
"lifespan": 0,
"expiration": "2014-11-18",
"age": 0,
"prod_Id": 4
},
{
"id": 10,
"name": "Pale Pilsen",
"size": "1lb",
"price": 0,
"bottles": 12,
"cases": 12,
"brand": "SMB",
"lifespan": 0,
"expiration": "2014-11-13",
"age": 0,
"prod_Id": 6
},
{
"id": 2,
"name": "Mogu-mogu",
"size": "1L",
"price": 0,
"bottles": 12,
"cases": 21,
"brand": "SMB",
"lifespan": 0,
"expiration": "2014-11-19",
"age": 0,
"prod_Id": 17
}
];
    $scope.variants = 
    [
    {
        "id": 1,
        "name": "Mogu-mogu",
        "size": "1L",
        "price": 45,
        "bottles": 12,
        "cases": 21,
        "brand": "SMB",
        "lifespan": 12,
        "prod_Id": 17
    },
    {
        "id": 2,
        "name": "Mogu-mogu",
        "size": "12",
        "price": 12,
        "bottles": 0,
        "cases": 0,
        "brand": "SMB",
        "lifespan": 12,
        "prod_Id": 17
    },
    {
        "id": 3,
        "name": "Pale Pilsen",
        "size": "1lb",
        "price": 12,
        "bottles": 12,
        "cases": 12,
        "brand": "SMB",
        "lifespan": 123,
        "prod_Id": 6
    },
    {
        "id": 4,
        "name": "Royal",
        "size": "12",
        "price": 21,
        "bottles": 120,
        "cases": 120,
        "brand": "Coca-Cola",
        "lifespan": 12,
        "prod_Id": 4
    }
    ];
    $scope.products = 
    [
    {
        "id": 1,
        "name": "Mogu-mogu",
        "size": "1L",
        "price": 45,
        "bottles": 12,
        "cases": 21,
        "brand": "SMB",
        "lifespan": 12,
        "prod_Id": 17
    },
    {
        "id": 2,
        "name": "Mogu-mogu",
        "size": "12",
        "price": 12,
        "bottles": 0,
        "cases": 0,
        "brand": "SMB",
        "lifespan": 12,
        "prod_Id": 17
    },
    {
        "id": 3,
        "name": "Pale Pilsen",
        "size": "1lb",
        "price": 12,
        "bottles": 12,
        "cases": 12,
        "brand": "SMB",
        "lifespan": 123,
        "prod_Id": 6
    },
    {
        "id": 4,
        "name": "Royal",
        "size": "12",
        "price": 21,
        "bottles": 120,
        "cases": 120,
        "brand": "Coca-Cola",
        "lifespan": 12,
        "prod_Id": 4
    }
    ];
    
    $scope.selectTab = function (selectedTab) {
      $scope.tab = selectedTab;
    }

    $scope.addProduct = function (product) {
      $scope.products.push(product);
      $scope.newProduct = {};
    }; 

    $scope.editProd = function (data) {
      $scope.showEditForm = true;
      $scope.showAddForm = false;
       $scope.productEdit.id = data.id;
      $scope.productEdit.prod_Id = data.prod_Id;
      $scope.productEdit.name = data.name;
      $scope.productEdit.brand = data.brand;
    };

    $scope.editVar = function (data) {
      $scope.showEditVariantForm = true;
      $scope.variantEdit.id = data.id;
      $scope.variantEdit.name = data.name;
      $scope.variantEdit.size = data.size;
      $scope.variantEdit.brand = data.brand;
      $scope.variantEdit.cases = data.cases;
      $scope.variantEdit.bottles = data.bottles;
      $scope.variantEdit.price = data.price;
      $scope.variantEdit.lifespan = data.lifespan;
    };

    $scope.saveEditProduct = function (data) {
     $scope.showEditForm = false;
     console.log(data);
     for (var i = 0; i < $scope.products.length; i++) {
       if ($scope.products[i].id == data.id) {
           $scope.products[i] = data;
           break;
       } 
     }
    }

    $scope.saveEditVariant = function (data) {
     $scope.showEditVariantForm = false;
     console.log(data);
     for (var i = 0; i < $scope.variants.length; i++) {
       if ($scope.variants[i].id == data.id) {
           $scope.variants[i] = data;
           break;
       } 
     }
    }    

  }]);
