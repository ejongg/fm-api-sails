'use strict';

angular.module('fmApp')
.controller('SKUCtrl',['$scope','$sailsSocket','_','$filter', function($scope, $sailsSocket, _,$filter){
	$scope.products = [];
  $scope.skuLists = [];
	$scope.existingCompany = [];
	$scope.companyFilter = {};
	$scope.sku = {};
  $scope.skuEdit = {};

  $scope.units = ["L","oz"];
  
  $scope.addSKUForm = false;
  $scope.editSKUForm = false;
  
  $scope.noExistingProduct = false;
  
  /*
  Show add sku form
  - If data is false clear the form.
  */
  $scope.showAddSkuForm = function (data) {
    $scope.addSKUForm = data;
    console.log("add here");
    $scope.clearForm();
  }

  $scope.showEditSkuForm = function (data) {
    $scope.editSKUForm = data;
    console.log("edit here");
  }
  
  /*
  Clear form inputs
  */
  $scope.clearForm = function () {
    $scope.sku.size = '';
    $scope.sku.price = '';
    $scope.sku.bottlespercase= '';
  }
  
  /*
  Open edit form and close if add sku form is open
  */
  $scope.skuClicked = function (sku) {
    console.log(sku);
    $scope.skuEdit = sku;
    $scope.showEditSkuForm(true);

    if($scope.addSKUForm === true){
      $scope.showAddSkuForm(false);
    }
  }
  
  /*
  Get products in the server
   - if there are no products in the server set noExistingProduct to true.
   - if there are already products in the server get the company and set the first option in the dropdown.
  */
	var getProducts = function (){  
      $sailsSocket.get('/products').success(function (data) {
      $scope.products = data;

      if($scope.products.length === 0){
        $scope.noExistingProduct = true;
      }else{
        $scope.existingCompany = _.uniq($scope.products,'company');
        $scope.sku.prod_name = $scope.products[0].prod_name;
      }
      }).error(function (err) {
      console.log(err);
      });
  };
  
  /*
  Get sku in the server
  */
  var getSKULists = function (){  
      $sailsSocket.get('/sku').success(function (data) {
      $scope.skuLists = data;
      console.log(data);
      }).error(function (err) {
      console.log(err);
      });
  };
    
  getProducts(); 
  getSKULists();

  /*
   Add SKU in the server
    - If the success clear the form and close the form.
  */
  $scope.addSKU = function (sku) {
    console.log(sku);
    var size = sku.size + ' ' +sku.unit;
    var prod_id = _.result(_.find($scope.products, {'prod_name': sku.prod_name }), 'id');
    var skuInfo = {
      "sku_name":sku.prod_name,
      "size":size,
      "price":sku.price,
      "bottlespercase": sku.bottlespercase,
      "prod_id": prod_id
    }
    console.log(skuInfo);

    $sailsSocket.post('/sku', skuInfo).success(function (data) {
      console.log(data);
      $scope.skuLists.push(data);
      $scope.showAddSkuForm(false);
      $scope.clearForm();
    }).error(function (err) {
      console.log(err);
    });

  };

  /*
  Connect to socket and listen to products model
  */
  $sailsSocket.subscribe('products', function(msg){
    if(msg.verb === 'created'){   
	    if(_.findIndex($scope.existingCompany, function(prod) { return prod.company == msg.data.company; }) === -1){
	        $scope.existingCompany.push(msg.data);
	    }
      $scope.products.push(msg.data);
	  }
  });

}]);
