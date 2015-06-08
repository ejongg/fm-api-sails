'use strict';

angular.module('fmApp')
.controller('ProductsCtrl',['$scope','$http','_','$filter','httpHost','authService','$modal',
  function($scope, $http, _,$filter, httpHost, authService, $modal){

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

  $scope.errorMessage = '';
  $scope.hasError = false;

  //forSorting. Default is set to id
  $scope.sortCriteria = 'id';
  $scope.reverseSort = false;

  $scope.cokePage = 1;
  $scope.smbPage = 1;  
  $scope.cokefilteredData = [];
  $scope.smbfilteredData = [];
  //$scope.filteredAndSortedData = [];
  //$scope.companySelect='';
  $scope.noOfRows = 0;
  $scope.newlyAdded = {};
  $scope.index = 0;


  var getProducts = function () {
    $http.get(httpHost + '/products').success( function (data) {
      
      if(data.length !== 0){
        $scope.products = $scope.sortData(data,'brand_name');
        console.log("Products:");
        console.log($scope.products);
      }else{
        $scope.noProducts = true;
      }

    }).error(function (err) {
        $scope.checkError(err);
    });
  };

  var setPage = function(){
    console.log("NEW PRODUCT:");
    console.log($scope.newlyAdded);

    var comp = $scope.newlyAdded.company;
    var name = $scope.newlyAdded.brand_name;
    console.log("company:");
    console.log(comp);
    console.log("name");
    console.log(name);

    //$scope.companySelect = comp;

    $scope.filteredData = $filter('filter')($scope.products, comp);
    $scope.filteredAndSortedData =  $scope.sortData($scope.filteredData, 'brand_name');
    $scope.index = _.findIndex($scope.filteredAndSortedData,{'brand_name' : name});

    if(comp == "SMB"){
      $scope.smbPage = Math.ceil($scope.index/$scope.noOfRows);
    }else{
      $scope.cokePage = Math.ceil($scope.index/$scope.noOfRows);
    }
    
   
    console.log("FILTEREDDD");
    console.log($scope.filteredData); //debugging purposes. to be deleted.

    console.log($scope.filteredAndSortedData);
    console.log("COMPANY :");

    console.log($scope.newlyAdded);

    console.log(comp);
   
    console.log("no of rows");
    console.log($scope.noOfRows);
    //$scope.index = _.findIndex($scope.filteredAndSortedData,{'bay_name' : name});
    //$scope.currentPage = Math.ceil($scope.index/$scope.noOfRows);
    console.log("CURRENT PAGE: " + $scope.currentPage);
    console.log("INDEX: " + $scope.index);
  };

  getProducts();

  $scope.pagePrint = function () {
    window.print();
  };

    $scope.showErrorMessage = function (data,msg) {
     $scope.hasError = data;
     console.log($scope.hasError);
    if(data === true){
       console.log(data);
       console.log(msg);
       $scope.errorMessage = msg;
        $scope.productForm.$setPristine();
        $scope.product.brand_name = '';
        $scope.product.company = $scope.companies[0];

    }
  }


  $scope.showAddProductForm = function (data) {
    $scope.productForm.$setPristine();
    $scope.hasError = false;
    if($scope.editOrDeleteProductForm === true) {
        $scope.showEditOrDeleteProductForm(false);
      }
      
      $scope.addProductForm = data;
      if(data === false){
          $scope.productForm.$setPristine();
          $scope.product.brand_name = '';
          $scope.product.company = $scope.companies[0];
      }
  };

  $scope.showEditOrDeleteProductForm = function (data) {
    $scope.editOrDeleteProductForm = data;
    $scope.productForm.$setPristine();
    $scope.hasError = false;
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
        console.log("PRODUCTTT:");
        console.log(product);
        $scope.newlyAdded = body;
        setPage();
        $scope.snackbarShow('Product Created');
      }else if (JWR.statusCode === 400){
        console.log("Product already exist");
        $scope.showErrorMessage(true,body);
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
      }else if(JWR.statusCode === 400){
        console.log("Product already exist");
        $scope.showErrorMessage(true,body);
      }else{
        console.log("Error!!!");
      }
  
      $scope.$digest();
      
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
        $scope.products.unshift(msg.data);
        $scope.products = $scope.sortData($scope.products,'brand_name');
        $scope.$digest();
        break;
      case "updated":
        console.log("Product Updated");
        var index = _.findIndex($scope.products,{'id': msg.data.id});
        $scope.products[index] = msg.data;
        $scope.products = $scope.sortData($scope.products,'brand_name');
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Product Deleted");
        var index = _.findIndex($scope.products,{'id': msg.data[0].prod_id});
        console.log(index);
        $scope.products.splice(index,1);
        $scope.products = $scope.sortData($scope.products,'brand_name');

        if($scope.products.length === 0){
          $scope.noProducts = true;
        }
        $scope.$digest();
    }
  });

  $scope.open = function (product) {
    console.log("Open Modal");

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'productModalDelete.html',
      controller: 'ProductModalCtrl',
      resolve: {
        product: function () {
          return product;
        }
      }
    });

    modalInstance.result.then(function (product) {
      $scope.deleteProduct(product);
    }, function () {
      console.log("close");
    });

  };


}])

.controller('ProductModalCtrl', function ($scope, $modalInstance, product) {

  $scope.ok = function () {
    $modalInstance.close(product);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});



 