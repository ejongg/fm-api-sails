'use strict';

angular.module('fmApp')
.controller('ProductsCtrl',['$scope','$sailsSocket','_','$filter', function($scope, $sailsSocket, _,$filter){
  $scope.addProduct = false;
  $scope.newProductTab = true;
  $scope.products = [];
  $scope.prod_rev = false;
  $scope.company_rev = false;
  
  $scope.editOrDeleteProductPane = false;
  $scope.editProductTab = true;
  $scope.editOrDeleteProduct = {};

  $scope.noExistingProduct = false;

  $scope.product = {};
  $scope.product.prod_name = '';
  $scope.product.company = '';

  $scope.existingCompanyProduct = {};
  $scope.existingCompanyProduct.prod_name = '';
  $scope.existingCompanyProduct.company = '';

  $scope.existingCompany = [];

  $scope.errorMessage = "";
  $scope.hasError = false;

  $scope.pageSize = 5;
  $scope.maxSize = 5;
  $scope.totalItems = 0;
  $scope.currentPage = 1;

   var orderBy = $filter('orderBy');

  $scope.showAddProduct = function (data) {
    $scope.addProduct = data;
    clearForm();
    console.log($scope.editOrDeleteProductPane);
    if($scope.editOrDeleteProductPane === true){
      $scope.editOrDeleteProductPane = false;
    }
    if(data === false) {
      if($scope.newProductTab === false){
        $scope.setNewProductTab(true);
      }
      if($scope.hasError === true){
        $scope.hasError = false;
      }
    }
  };

  $scope.setNewProductTab = function (data) {
    clearForm();
    console.log($scope.noExistingProduct);
    $scope.newProductTab = data;
  };

  $scope.productClicked = function (product) {
    $scope.editOrDeleteProduct = angular.copy(product);
    if($scope.addProduct === true){
      $scope.addProduct = false;
    }
    $scope.showEditOrDeleteProducts(true);
  };

  $scope.showEditOrDeleteProducts = function (data) {
    $scope.editOrDeleteProductPane = data;
    if(data === false) {
      $scope.editOrDeleteProduct = {};
      if($scope.editProductTab === false){
        $scope.setEditProductTab(true);
      }
    }
  };

  $scope.setEditProductTab = function (data) {
    $scope.editProductTab = data;
  };

  var clearForm =function () {
    $scope.product.prod_name= "";
    $scope.product.company="";
    $scope.existingCompanyProduct.prod_name= "";
    if($scope.noExistingProduct === false){
      $scope.existingCompanyProduct.company = $scope.existingCompany[0].company;
    }
  };

  var getProducts = function (){  
    $sailsSocket.get('/products').success(function (data) {
    $scope.products = data;
    console.log($scope.products.length);  
    if($scope.products.length === 0) {
      $scope.noExistingProduct = true;
    }else{
      $scope.totalItems = $scope.products.length;
      console.log($scope.products);
      $scope.existingCompany = _.uniq($scope.products,'company');
      console.log($scope.existingCompany);
      // $scope.existingCompanyProduct.company = $scope.existingCompany[0].company;
    }
    }).error(function (err) {
      console.log(err);
    });
  };
  
  getProducts();

  $scope.addNewProduct = function(data){
     var productInfo = {};
    if(angular.isObject(data.company)){
      var companyObject = data.company;
      productInfo = {
        prod_name: data.prod_name,
        company: companyObject.company
      };  
    }else {
     productInfo = {
        prod_name: data.prod_name,
        company: data.company
     };

    }

    $sailsSocket.post('/products', productInfo).success(function (data) {
      console.log(data);

      if(_.findIndex($scope.existingCompany, function(prod) { return prod.company == data.company; }) === -1){
        $scope.existingCompany.push(data);
      }

      $scope.products.push(data);

      if($scope.noExistingProduct === true){
        $scope.noExistingProduct = false;
      }

      $scope.totalItems = $scope.products.length;
      console.log($scope.totalItems);
      $scope.addProduct = false;
      clearForm();
      $scope.setNewProductTab(true);
    }).error(function (err) {
      if(err.error === 'E_VALIDATION'){
        setFormError("Name is already used.");
        clearForm();
      }
    });
    // $scope.addProduct = false;
    // clearForm();
    // $scope.setNewProductTab(true);
  };

  var setFormError = function (message) {
    $scope.errorMessage = message;
    $scope.showError(true);
  }

  $scope.showError = function (data) {
    if(data === true) {
      $scope.hasError = true;
    }else{
      $scope.hasError = false;
    }
  }

  $scope.editProduct = function (data) {
    var newInfo = {
      "prod_name": data.prod_name,
      "company": data.company
    }
    $sailsSocket.put('/products/' + data.id, newInfo).success(function (data) {
      console.log(data.id);
      var index = _.findIndex($scope.products, function(prod) { return prod.id == data.id; });
      console.log(index);

      if(_.findIndex($scope.existingCompany, function(prod) { return prod.company == data.company; }) === -1){
        $scope.existingCompany.push(data);
      }

      $scope.products[index] = data;
      $scope.existingCompany = _.uniq($scope.products,'company');
    }).error(function (err) {
      console.log(err);
    });

    $scope.editOrDeleteProductPane = false;
  };

  $scope.deleteProduct = function (product) {
    console.log(product.id);
    $sailsSocket.delete('/products/' + product.id).success(function (data) {
      console.log(data.id);
    //   console.log("delete");

      var index = _.findIndex($scope.products, function(prod) { return prod.id == data.id; });
      console.log(index);
      $scope.products.splice(index,1);
      
      if($scope.products.length === 0){
        $scope.noExistingProduct = true;
      }
      $scope.totalItems = $scope.products.length;
      $scope.existingCompany = _.uniq($scope.products,'company');
    }).error(function (err) {
      console.log(err);
    });

    $scope.editOrDeleteProductPane = false;
    $scope.setEditProductTab(true);
  };

  $scope.order = function(predicate, reverse) {
    $scope.products = orderBy($scope.products, predicate, reverse);
  };

}]);