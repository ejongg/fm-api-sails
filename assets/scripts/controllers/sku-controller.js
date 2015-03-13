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
  

  var getProducts = function (){  
    io.socket.request($scope.socketOptions('get','/products'), function (body, JWR) {
      console.log('Sails responded with get products: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.products = body;

        if($scope.products.length === 0){
          $scope.noExistingProduct = true;
        }else{
          $scope.existingCompany = _.uniq($scope.products,'company');
          $scope.sku.prod_name = $scope.products[0].prod_name;
        }
        $scope.$digest();
      }
    });
  };
  
  /*
  Get sku in the server
  */
  var getSKULists = function (){  
    io.socket.request($scope.socketOptions('get','/sku'), function (body, JWR) {
      console.log('Sails responded with get sku: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.skuLists = body;
        $scope.$digest();
      }
    });
  };
    
  getProducts(); 
  getSKULists();

    /*
  Get products in the server
   - if there are no products in the server set noExistingProduct to true.
   - if there are already products in the server get the company and set the first option in the dropdown.
  */
  // var getProducts = function (){  
  //     $sailsSocket.get('/products').success(function (data) {
  //     $scope.products = data;

      // if($scope.products.length === 0){
      //   $scope.noExistingProduct = true;
      // }else{
      //   $scope.existingCompany = _.uniq($scope.products,'company');
      //   $scope.sku.prod_name = $scope.products[0].prod_name;
      // }
  //     }).error(function (err) {
  //     console.log(err);
  //     });
  // };
  
  /*
  Get sku in the server
  */
  // var getSKULists = function (){  
  //     $sailsSocket.get('/sku').success(function (data) {
  //     $scope.skuLists = data;
  //     console.log(data);
  //     }).error(function (err) {
  //     console.log(err);
  //     });
  // };
    
  /*
  Show add sku form
  - If data is false clear the form.
  */
  $scope.showAddSkuForm = function (data) {
    $scope.addSKUForm = data;
    clearForm();
    if($scope.editOrDeleteSKUForm === true){
      $scope.showEditOrDeleteSkuForm(false);
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
    $scope.sku.size = null ;
    $scope.sku.price = null;
    $scope.sku.bottlespercase= null;
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

    // $sailsSocket.post('/sku', skuInfo).success(function (data) {
    //   console.log(data);
    //   $scope.skuLists.push(data);
    //   $scope.showAddSkuForm(false);
    //   clearForm();
    // }).error(function (err) {
    //   console.log(err);
    // });

    io.socket.request($scope.socketOptions('post','/sku',{},skuInfo), function (body, JWR) {
      console.log('Sails responded with post sku: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 400){
        console.log("SKU already exist");
      }
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

    // $sailsSocket.put('/sku/' + sku.id, newInfo).success(function (data) {
    //   var index = _.findIndex($scope.skuLists, function(sku) { return sku.id == data.id; });
    //   $scope.skuLists[index] = data;
    //   $scope.showEditOrDeleteSkuForm(false);
    // }).error(function (err) {
    //   console.log(err);
    // });
    io.socket.request($scope.socketOptions('put','/sku/' + sku.id,{},newInfo), function (body, JWR) {
      console.log('Sails responded with edit sku: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        
      }
    });

  };

  $scope.deleteSKU = function (sku) {
    $sailsSocket.delete('/sku/' + sku.id).success(function (data) {
      // var index = _.findIndex($scope.skuLists, function(skuItem) { return skuItem.id == data.id; });
      // console.log(index);
      // $scope.skuLists.splice(index,1);
      // $scope.showEditOrDeleteSkuForm(false);
    }).error(function (err) {
      console.log(err);
    });
  }

  /*
  Connect to socket and listen to products model
  */
  io.socket.on('products', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);
    
    switch (msg.verb) {
      case "created": 
        console.log("Product Created");
        $scope.products.push(msg.data);
        $scope.existingCompany = _.uniq($scope.products, 'company');
        $scope.$digest();
        break;
      case "updated":
        console.log("Product Updated");
        var index = _.findIndex($scope.products,{'id': msg.data.id});
        $scope.products[index] = msg.data;
        $scope.existingCompany = _.uniq($scope.products, 'company');
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Product Deleted");
        var index = _.findIndex($scope.products,{'id': msg.data.id});
        $scope.products.splice(index,1);
        $scope.$digest();
    }
  });

  io.socket.on('sku', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);
    
    switch (msg.verb) {
      case "created": 
        console.log("SKU Created");
        $scope.skuLists.push(msg.data);
        $scope.showAddSkuForm(false);
        $scope.$digest();
        break;
      case "updated":
        console.log("SKU Updated");
        var index = _.findIndex($scope.skuLists,{'id': msg.data.id});
        $scope.skuLists[index] = msg.data;
        $scope.showEditOrDeleteSkuForm(false);
        $scope.$digest();
        break;
      case "destroyed":
        console.log("SKU Deleted");
        var index = _.findIndex($scope.skuLists,{'id': msg.data.id});
        $scope.skuLists.splice(index,1);
        $scope.showEditOrDeleteSkuForm(false);
        $scope.$digest();
    }
  });

}]);
