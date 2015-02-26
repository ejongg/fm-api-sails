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
  $scope.editOrDeleteSKUForm = false;
  $scope.editSKUTab = true;
  
  $scope.noExistingProduct = false;
  
  /*
  Show add sku form
  - If data is false clear the form.
  */
  $scope.showAddSkuForm = function (data) {
    $scope.addSKUForm = data;
    console.log("add here");
    $scope.clearForm();
    if($scope.editOrDeleteSKUForm === true){
      $scope.showEditOrDeleteSkuForm(false);
      console.log("false");
    } 
  }

  $scope.showEditOrDeleteSkuForm = function (data) {
    $scope.editOrDeleteSKUForm = data;
    console.log("edit here");
    if(data === false){
      if($scope.editSKUTab === false){
        $scope.setEditSKUTab(true);
      }
    }
  }

  $scope.setEditSKUTab = function (data) {
    $scope.editSKUTab = data;
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
    
    var copiedSku = angular.copy(sku);
    console.log(copiedSku);
    copiedSku.size = copiedSku.size.split(" ");
    console.log(copiedSku.size);
    $scope.skuEdit.id = copiedSku.id;
    $scope.skuEdit.sku_name = copiedSku.sku_name;
    $scope.skuEdit.price = copiedSku.price;
    $scope.skuEdit.bottlespercase = copiedSku.bottlespercase;
    $scope.skuEdit.size = parseFloat(copiedSku.size[0]);
    $scope.skuEdit.unit = copiedSku.size[1];

    if($scope.addSKUForm === true){
      $scope.showAddSkuForm(false);
    }

    $scope.showEditOrDeleteSkuForm(true);
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
    - If success clear the form and close the form.
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
   Edit SKU in the server
    - If success close the form.
  */
  $scope.editSKU = function (sku) {
    console.log(sku);
    var size = sku.size + ' ' +sku.unit;
    var prod_id = _.result(_.find($scope.products, {'prod_name': sku.prod_name }), 'id');

    var newInfo = {
      "sku_name":sku.sku_name,
      "size":size,
      "price":sku.price,
      "bottlespercase": sku.bottlespercase,
      "prod_id": prod_id
    }
    console.log(newInfo);

    $sailsSocket.put('/sku/' + sku.id, newInfo).success(function (data) {
      var index = _.findIndex($scope.skuLists, function(sku) { return sku.id == data.id; });
      $scope.skuLists[index] = data;
      $scope.showEditOrDeleteSkuForm(false);
    }).error(function (err) {
      console.log(err);
    });

  };

  $scope.deleteSKU = function (sku) {
    $sailsSocket.delete('/sku/' + sku.id).success(function (data) {

      var index = _.findIndex($scope.skuLists, function(skuItem) { return skuItem.id == data.id; });
      console.log(index);
      $scope.skuLists.splice(index,1);
      $scope.showEditOrDeleteSkuForm(false);
    }).error(function (err) {
      console.log(err);
    });
  }

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
