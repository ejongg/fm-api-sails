'use strict';

angular.module('fmApp')
.controller('ProductsCtrl',['$scope','$http','_','$filter','httpHost','authService', function($scope, $http, _,$filter, httpHost, authService){

  $scope.products = [];
  $scope.existingCompany = [];

  $scope.product = {};
  $scope.productExistingCompany = {};
  $scope.productEdit = {};
  $scope.productDelete = {};
  $scope.copiedProduct = {};

  $scope.addProductForm = false;
  $scope.editOrDeleteProductForm = false;
  $scope.newProductTab = true;
  $scope.editProductTab = true;

  $scope.noProducts = true;


  var getProducts = function () {
    // io.socket.request($scope.socketOptions('get','/products'), function (body, JWR) {
    //   console.log('Sails responded with get user: ', body);
    //   console.log('and with status code: ', JWR.statusCode);
    //   if(JWR.statusCode === 200){
    //     $scope.products = body;
    //     $scope.existingCompany = _.uniq($scope.products, 'company');
    //     $scope.productExistingCompany.company = $scope.existingCompany[0].company;
    //     $scope.$digest();
    //   }
    // });
    $http.get(httpHost + '/products').success( function (data) {
      
      if(data.length !== 0){
        $scope.products = data;
        $scope.existingCompany = _.uniq($scope.products, 'company');
        $scope.productExistingCompany.company = $scope.existingCompany[0].company;
        $scope.noProducts = false;
 
        console.log("Products:");
        console.log($scope.products);
      }

    }).error(function (err) {
      console.log(err);
    });
  };

  getProducts();

  $scope.showAddProductForm = function (data) {
    if($scope.editOrDeleteProductForm === true) {
        $scope.showEditOrDeleteProductForm(false);
      }
      
      $scope.addProductForm = data;
      if(data === false){
        if($scope.newProductTab === false){
          $scope.setNewProductTab(true);
        }else{
          $scope.product = {};
        }
      }
  };

  $scope.showEditOrDeleteProductForm = function (data) {
      $scope.editOrDeleteProductForm = data;
  };

  $scope.setNewProductTab = function (data){
    $scope.newProductTab = data;
    if(data === true){
      $scope.product = {};
    }else{
      $scope.productExistingCompany.brand_name = '';
      $scope.productExistingCompany.company = $scope.existingCompany[0].company;
    }
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
    console.log("clicked add");
    console.log(product);
    io.socket.request($scope.socketOptions('post','/products',{"Authorization": "Bearer " + authService.getToken()},product), function (body, JWR) {
      console.log('Sails responded with post product: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 400){
        console.log("Product already exist");
      }
    });
  };

  $scope.editProduct = function (newInfo) {
    io.socket.request($scope.socketOptions('put','/products/' + newInfo.id,{"Authorization": "Bearer " + authService.getToken()},newInfo), function (body, JWR) {
      console.log('Sails responded with edit product: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        
      }
    });
  };

  $scope.deleteProduct = function (product) {
    console.log(product);
    io.socket.request($scope.socketOptions('delete','/products/' + product.id,{"Authorization": "Bearer " + authService.getToken()}), function (body, JWR) {
      console.log('Sails responded with delete product: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        
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
        $scope.existingCompany = _.uniq($scope.products, 'company');
        $scope.showAddProductForm(false);
        $scope.$digest();
        break;
      case "updated":
        console.log("Product Updated");
        var index = _.findIndex($scope.products,{'id': msg.data.id});
        $scope.products[index] = msg.data;
        $scope.existingCompany = _.uniq($scope.products, 'company');
        $scope.showEditOrDeleteProductForm(false);
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Product Deleted");
        var index = _.findIndex($scope.products,{'id': msg.data.id});
        $scope.products.splice(index,1);

        if($scope.products.length === 0){
          $scope.noProducts = true;
        }

        $scope.showEditOrDeleteProductForm(false);
        $scope.$digest();
    }
  });

}]);



 