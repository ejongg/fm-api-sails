'use strict';

angular.module('fmApp')
.controller('SKUCtrl',['$scope','_','authService','httpHost','$http', '$modal', 
  function($scope, _, authService, httpHost,$http, $modal){
	$scope.products = [];
  $scope.skuLists = [];
	$scope.existingCompany = [];
	$scope.companyFilter = {};
	$scope.sku = {};
  $scope.skuEdit = {};
  $scope.skuDelete = {};
  $scope.copiedSku = {};

  $scope.units = ["L","mL","oz", "Gallon"];
  
  $scope.addSKUForm = false;
  $scope.editOrDeleteSKUForm = false;
  $scope.editSKUTab = true;
  
  $scope.noProducts = false;
  $scope.noSKU = false;

  $scope.errorMessage = '';
  $scope.hasError = false;

  // forSorting
  $scope.sortCriteria = 'id';
  $scope.reverseSort = false;

  $scope.showErrorMessage = function (data,msg) {
    $scope.hasError = data;
    console.log($scope.hasError);
    
    if(data === true){
      console.log(data);
      console.log(msg);
      $scope.errorMessage = msg;
      $scope.skuForm.$setPristine();
      clearForm();
    }
  }
  

  var getProducts = function (){  
    $http.get(httpHost + '/products').success( function (data) {
      
      if(data.length !== 0){
        $scope.products = $scope.sortData(data,'brand_name');
        $scope.sku.brand_name = $scope.products[0].brand_name;
        console.log("Products:");
        console.log($scope.products);
      }else{
        $scope.noProducts = true;
      }

    }).error(function (err) {
      $scope.checkError(err);
    });
  };
  
  /*
  Get sku in the server
  */
  var getSKULists = function (){  
    $http.get(httpHost + '/sku').success( function (data) {
      
      if(data.length !== 0){
        $scope.skuLists = data;
        console.log("SKU List:");
        console.log($scope.skuLists);
      }else{
        $scope.noSKU = true;
      }

    }).error(function (err) {
      $scope.checkError(err);
    });
  };
    
  getProducts(); 
  getSKULists();

  $scope.pagePrint = function () {
    window.print();
  };
  /*
  Show add sku form
  - If data is false clear the form.
  */
  $scope.showAddSkuForm = function (data) {
    $scope.skuForm.$setPristine();
    $scope.hasError = false;
    $scope.addSKUForm = data;
    if(data === false){
       clearForm();
    }
    if($scope.editOrDeleteSKUForm === true){
      $scope.showEditOrDeleteSkuForm(false);
    } 
  }
  
  /*
  Show edit or sku form
  */
  $scope.showEditOrDeleteSkuForm = function (data) {
    $scope.editOrDeleteSKUForm = data;
    $scope.skuForm.$setPristine();
    $scope.hasError = false;   
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
    console.log("clear form");
    $scope.skuForm.$setPristine();
    $scope.sku.brand_name = $scope.products[0].brand_name;
    $scope.sku.sku_name = '';
    $scope.sku.size = null;
    $scope.sku.unit = $scope.units[0];
    $scope.sku.priceperbottle = null;
    $scope.sku.pricepercase = null;
    $scope.sku.bottleprice = null;
    $scope.sku.bottlespercase = null;
    $scope.sku.weightpercase = null;
    $scope.sku.lifespan = null;
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
    $scope.skuEdit.brand_name = $scope.copiedSku.prod_id.brand_name;
    var sku_name = $scope.copiedSku.sku_name.split(" ");
    var lastWord = sku_name.length - 1;
    $scope.skuEdit.sku_name =  sku_name[lastWord];
    $scope.skuEdit.size = parseInt($scope.copiedSku.size[0]);
    $scope.skuEdit.unit = $scope.copiedSku.size[1];
    $scope.skuEdit.priceperbottle = $scope.copiedSku.priceperbottle;
    $scope.skuEdit.pricepercase = $scope.copiedSku.pricepercase;
    $scope.skuEdit.bottlespercase = $scope.copiedSku.bottlespercase;
    $scope.skuEdit.weightpercase = $scope.copiedSku.weightpercase;
    $scope.skuEdit.lifespan = $scope.copiedSku.lifespan;

    $scope.skuDelete.id = $scope.copiedSku.id;
    $scope.skuDelete.sku_name = $scope.copiedSku.sku_name;
    $scope.skuDelete.size = parseInt($scope.copiedSku.size[0]);
    $scope.skuDelete.unit = $scope.copiedSku.size[1];
    $scope.skuDelete.priceperbottle = $scope.copiedSku.priceperbottle;
    $scope.skuDelete.pricepercase = $scope.copiedSku.pricepercase;
    $scope.skuDelete.bottlespercase = $scope.copiedSku.bottlespercase;
    $scope.skuDelete.weightpercase = $scope.copiedSku.weightpercase;
    $scope.skuDelete.lifespan = $scope.copiedSku.lifespan;

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
    var prod_id = _.result(_.find($scope.products, {'brand_name': sku.brand_name }), 'id');
    var skuInfo = {
      "sku_name":sku.sku_name,
      "size":size,
      "priceperbottle":sku.priceperbottle,
      "pricepercase":sku.pricepercase,
      "bottlespercase": sku.bottlespercase,
      "weightpercase": sku.weightpercase,
      "lifespan": sku.lifespan,
      "prod_id": prod_id
    }
    console.log(skuInfo);

    io.socket.request($scope.socketOptions('post','/sku',{"Authorization": "Bearer " + authService.getToken()},skuInfo), function (body, JWR) {
      console.log('Sails responded with post sku: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if (JWR.statusCode === 201) {
        $scope.showAddSkuForm(false);
        $scope.snackbarShow('SKU Added');
      }else if(JWR.statusCode === 400){
        console.log("SKU already exist");
        $scope.showErrorMessage(true,body);
      }
       $scope.$digest();
    });

  };
  
  /*
   Edit SKU in the server
    - If success close the form.
  */
  $scope.editSKU = function (sku) {
    console.log(sku.brand_name);
    var size = sku.size + ' ' +sku.unit;
    var prod_id = _.result(_.find($scope.products, {'brand_name': sku.brand_name }), 'id');
 
    var newInfo = {
      "sku_name":sku.sku_name,
      "size":size,
      "priceperbottle":sku.priceperbottle,
      "pricepercase":sku.pricepercase,
      "bottlespercase": sku.bottlespercase,
      "weightpercase": sku.weightpercase,
      "lifespan": sku.lifespan,
      "prod_id": prod_id,
      "id": sku.id
    };
    console.log(newInfo);
    console.log(sku.id);

    io.socket.request($scope.socketOptions('put','/sku/edit',{"Authorization": "Bearer " + authService.getToken()},newInfo), function (body, JWR) {
      console.log('Sails responded with edit sku: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.showEditOrDeleteSkuForm(false);
        $scope.snackbarShow('SKU Edited');
      }else if(JWR.statusCode === 400){
        console.log("SKU already exist");
        $scope.showErrorMessage(true,body);
      }
        $scope.$digest();
    });

  };

  $scope.deleteSKU = function (sku) {
    // $sailsSocket.delete('/sku/' + sku.id).success(function (data) {
    //   // var index = _.findIndex($scope.skuLists, function(skuItem) { return skuItem.id == data.id; });
    //   // console.log(index);
    //   // $scope.skuLists.splice(index,1);
    //   // $scope.showEditOrDeleteSkuForm(false);
    // }).error(function (err) {
    //   console.log(err);
    // });
    io.socket.request($scope.socketOptions('delete','/sku/' + sku.id,{"Authorization": "Bearer " + authService.getToken()}), function (body, JWR) {
      console.log('Sails responded with delete sku: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.showEditOrDeleteSkuForm(false);
        $scope.snackbarShow('SKU Deleted');
        $scope.$digest();
      }
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
        if($scope.products.length === 0){
          $scope.noProducts = false;
          $scope.noSKU = true;
        }
        $scope.products.push(msg.data);
        // $scope.existingCompany = _.uniq($scope.products, 'company');
         $scope.products = $scope.sortData($scope.products,'brand_name');
        $scope.sku.brand_name = $scope.products[0].brand_name;
        $scope.$digest();
        break;
      case "updated":
        console.log("Product Updated");
        var index = _.findIndex($scope.products,{'id': msg.data.id});
        $scope.products[index] = msg.data;
        // $scope.existingCompany = _.uniq($scope.products, 'company');
         $scope.products = $scope.sortData($scope.products,'brand_name');
        $scope.sku.brand_name = $scope.products[0].brand_name;
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Product Deleted");
        var index = _.findIndex($scope.products,{'id': msg.data[0].prod_id});
        $scope.products.splice(index,1);

        if($scope.products.length === 0){
          $scope.noProducts = true;
          if($scope.addSKUForm === true){
            console.log("Close form");
            $scope.addSKUForm = false;
          }else if($scope.editOrDeleteSKUForm === true){
            $scope.editOrDeleteSKUForm = false;
          }
        }else{
          console.log("change filter");
          // $scope.existingCompany = _.uniq($scope.products, 'company');
          // console.log($scope.existingCompany);
          $scope.products = $scope.sortData($scope.products,'brand_name');
          $scope.sku.brand_name = $scope.products[0].brand_name;
        }
        
       //  _.remove($scope.skuLists.prod_id,msg.data.prod_id);
       // console.log(msg.data[0]);
       // console.log(msg.data);

        $scope.skuLists = _.remove($scope.skuLists, function(n) {
          console.log(n.prod_id.id);
          console.log(msg.data[0].prod_id);
          return n.prod_id.id !== msg.data[0].prod_id;
        });

        // console.log($scope.skuLists);

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
        if($scope.noSKU === true){
          $scope.noSKU = false;
        }
        $scope.$digest();
        break;
      case "updated":
        console.log("SKU Updated");
        console.log(msg.data);
        var index = _.findIndex($scope.skuLists,{'id': msg.data.id});
        $scope.skuLists[index] = msg.data;
        $scope.$digest();
        break;
      case "destroyed":
        console.log("SKU Deleted");
        var index = _.findIndex($scope.skuLists,{'id': msg.data[0].sku_id});
        console.log(msg.data[0].sku_id);
        console.log(index);
        $scope.skuLists.splice(index,1);
        if($scope.skuLists.length === 0){
          $scope.noSKU = true;
        }
        $scope.$digest();
    }
  });

    $scope.open = function (sku) {
    console.log("Open Modal");

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'skuModalDelete.html',
      controller: 'SkuModalCtrl',
      resolve: {
        sku: function () {
          return sku;
        }
      }
    });

    modalInstance.result.then(function (sku) {
      $scope.deleteSKU(sku);
    }, function () {
      console.log("close");
    });

  };

}])

  .controller('SkuModalCtrl', function ($scope, $modalInstance, sku) {

  $scope.ok = function () {
    $modalInstance.close(sku);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});
