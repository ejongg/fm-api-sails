'use strict';

angular.module('fmApp')
.controller('SKUCtrl',['$scope','$sailsSocket','_', function($scope, $sailsSocket, _){
	$scope.products = [];
  $scope.skuLists = [];
	$scope.existingCompany = [];
	$scope.companyFilter = {};
	$scope.sku = {};
  $scope.skuEdit = {};
  $scope.skuDelete = {};
  $scope.copiedSku = {};

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
    clearForm();
    if($scope.editOrDeleteSKUForm === true){
      $scope.showEditOrDeleteSkuForm(false);
      console.log("false");
    } 
  }
  
  /*
  Show edit or sku form
  */
  $scope.showEditOrDeleteSkuForm = function (data) {
    $scope.editOrDeleteSKUForm = data;
    console.log("edit here");
    if(data === false){
      if($scope.editSKUTab === false){
        $scope.setEditSKUTab(true);
      }
    }
  }
 
 /*
 If go back to edit it will reset the form
 */
  $scope.setEditSKUTab = function (data) {
    $scope.editSKUTab = data;
    if(data === true){
      $scope.skuEdit.id = $scope.copiedSku.id;
      $scope.skuEdit.sku_name = $scope.copiedSku.sku_name;
      $scope.skuEdit.price = $scope.copiedSku.price;
      $scope.skuEdit.bottlespercase = $scope.copiedSku.bottlespercase;
      $scope.skuEdit.size = parseFloat($scope.copiedSku.size[0]);
      $scope.skuEdit.unit = $scope.copiedSku.size[1];
    }
  }
  
  /*
  Clear form inputs
  */
  var clearForm = function () {
    $scope.sku.size = '';
    $scope.sku.price = '';
    $scope.sku.bottlespercase= '';
    $scope.sku.prod_name = $scope.products[0].prod_name;
    $scope.sku.unit = $scope.units[0];
  }
  
  /*
  Open edit form and close add sku form  if open
  */
  $scope.skuClicked = function (sku) {
    
    $scope.copiedSku = angular.copy(sku);
    console.log($scope.copiedSku);
    $scope.copiedSku.size = $scope.copiedSku.size.split(" ");
    console.log($scope.copiedSku.size);
    $scope.skuEdit.id = $scope.copiedSku.id;
    $scope.skuEdit.sku_name = $scope.copiedSku.sku_name;
    $scope.skuEdit.price = $scope.copiedSku.price;
    $scope.skuEdit.bottlespercase = $scope.copiedSku.bottlespercase;
    $scope.skuEdit.size = parseFloat($scope.copiedSku.size[0]);
    $scope.skuEdit.unit = $scope.copiedSku.size[1];

    $scope.skuDelete.id = $scope.copiedSku.id;
    $scope.skuDelete.sku_name = $scope.copiedSku.sku_name;
    $scope.skuDelete.price = $scope.copiedSku.price;
    $scope.skuDelete.bottlespercase = $scope.copiedSku.bottlespercase;
    $scope.skuDelete.size = parseFloat($scope.copiedSku.size[0]);
    $scope.skuDelete.unit = $scope.copiedSku.size[1];

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
      clearForm();
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
      console.log("CREATED CALL");
	    if(_.findIndex($scope.existingCompany, function(prod) { return prod.company == msg.data.company; }) === -1){
	        $scope.existingCompany.push(msg.data);
	    }
      $scope.products.push(msg.data);
	  }

    if(msg.verb === 'updated'){
      console.log(msg.data);
      var index = _.findIndex($scope.products, function(prod) { return prod.id == msg.data.id; });
      $scope.products[index] = msg.data;
      $scope.existingCompany = _.uniq($scope.products,'company');
      console.log($scope.skuLists);
    }

    if(msg.verb === 'destroyed'){
      console.log("Delete CALL");
      var index = _.findIndex($scope.products, function(prod) { return prod.id ==  msg.id; });
      $scope.products.splice(index,1);
      $scope.existingCompany = _.uniq($scope.products,'company');
    }

  });

}]);
