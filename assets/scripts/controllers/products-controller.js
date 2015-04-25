'use strict';

angular.module('fmApp')
.controller('ProductsCtrl',['$scope','$http','_','$filter','httpHost','authService',
  function($scope, $http, _,$filter, httpHost, authService){

  $scope.products = [];
  $scope.companies = ['Coca-Cola','SMB'];

  $scope.product = {};
  $scope.productExistingCompany = {};
  $scope.productEdit = {};
  $scope.productDelete = {};
  $scope.copiedProduct = {};

  $scope.addProductForm = false;
  $scope.editOrDeleteProductForm = false;
  $scope.editProductTab = true;

  $scope.noProducts = false;

  //forSorting. Default is set to id
  $scope.sortCriteria = 'id';

  var getProducts = function () {
    $http.get(httpHost + '/products').success( function (data) {
      
      if(data.length !== 0){
        $scope.products = data;
        console.log("Products:");
        console.log($scope.products);
      }else{
        $scope.noProducts = true;
      }

    }).error(function (err) {
        $scope.checkError(err);
    });
  };

  getProducts();

  $scope.pagePrint = function () {
    window.print();
  };

  $scope.showAddProductForm = function (data) {
    $scope.productForm.$setPristine();
    if($scope.editOrDeleteProductForm === true) {
        $scope.showEditOrDeleteProductForm(false);
      }
      
      $scope.addProductForm = data;
      if(data === false){
          $scope.product.brand_name = '';
          $scope.product.company = $scope.companies[0];
      }
  };

  $scope.showEditOrDeleteProductForm = function (data) {
    $scope.editOrDeleteProductForm = data;
  };

  $scope.setEditProductTab = function (data) {
    $scope.editProductTab = data;
    if(data === true){
      $scope.productEdit.id = $scope.copiedProduct.id;
      $scope.productEdit.brand_name = $scope.copiedProduct.brand_name;
      $scope.productEdit.company= $scope.copiedProduct.company;
    } 
  };
    
  $scope.productClicked = function (product) {
    if($scope.addProductForm === true){
      $scope.showAddProductForm(false);
    }
    
    if($scope.editProductTab === false){
      $scope.setEditProductTab(true);
    }

    $scope.copiedProduct = angular.copy(product);

    $scope.productEdit.id = $scope.copiedProduct.id;
    $scope.productEdit.brand_name = $scope.copiedProduct.brand_name;
    $scope.productEdit.company= $scope.copiedProduct.company;

    $scope.productDelete.id = $scope.copiedProduct.id;
    $scope.productDelete.brand_name = $scope.copiedProduct.brand_name;
    $scope.productDelete.company= $scope.copiedProduct.company;

    $scope.showEditOrDeleteProductForm(true);
  };

  $scope.addProduct = function (product) {
    io.socket.request($scope.socketOptions('post','/products',{"Authorization": "Bearer " + authService.getToken()},product), function (body, JWR) {
      console.log('Sails responded with post product: ', body);
      console.log('and with status code: ', JWR.statusCode);

      if(JWR.statusCode === 201){
        $scope.showAddProductForm(false);
        $scope.snackbarShow('Product Created');
      }else if (JWR.statusCode === 400){
        console.log("Product already exist");
      }else{
        console.log("Error!!!");
      }
    
      $scope.$digest();
    });
  };

  $scope.editProduct = function (newInfo) {
    io.socket.request($scope.socketOptions('put','/products/' + newInfo.id,{"Authorization": "Bearer " + authService.getToken()},newInfo), function (body, JWR) {
      console.log('Sails responded with edit product: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.showEditOrDeleteProductForm(false);
        $scope.snackbarShow('Product Edited');
        $scope.$digest();
      }
    });
  };

  $scope.deleteProduct = function (product) {
    io.socket.request($scope.socketOptions('delete','/products/' + product.id,{"Authorization": "Bearer " + authService.getToken()}), function (body, JWR) {
      console.log('Sails responded with delete product: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.showEditOrDeleteProductForm(false);
        $scope.snackbarShow('Product Deleted');
        $scope.$digest();
      }
    });
  };

  io.socket.on('products', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);
    
    switch (msg.verb) {
      case "created": 
        console.log("Product Created");
        if($scope.noProducts === true){
          $scope.noProducts = false;
        }
        $scope.products.push(msg.data);
        $scope.$digest();
        break;
      case "updated":
        console.log("Product Updated");
        var index = _.findIndex($scope.products,{'id': msg.data.id});
        $scope.products[index] = msg.data;
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Product Deleted");
        var index = _.findIndex($scope.products,{'id': msg.data[0].prod_id});
        console.log(index);
        $scope.products.splice(index,1);

        if($scope.products.length === 0){
          $scope.noProducts = true;
        }
        $scope.$digest();
    }
  });

}]);



 