'use strict';

angular.module('fmApp')
.controller('PurchasesCtrl',['$scope','_','$http','$filter','httpHost', function($scope, _, $http, $filter,httpHost){
  $scope.purchasesList = [];
  $scope.skuList = [];
  $scope.bays = [];
  $scope.purchases = [];
  $scope.purchaseProducts = [];

  $scope.purchase = {};
  $scope.purchase.prod_date = new Date();

  $scope.totalCost = 0;

  $scope.noBays = true;
  $scope.noSKU = true;
  $scope.noPurchase = true;


  $scope.itemExistingError = false;
  $scope.itemExisting = '';
  $scope.addPurchaseForm = false;
  $scope.viewProducts = false;
  
  
  var getSKU = function () {
    // $http.get('http://localhost:1337/sku').success(function(data){
    //   $scope.skuList = data;
    //   $scope.purchase.sku = $scope.skuList[0];
    // });
    // io.socket.request($scope.socketOptions('get','/sku'), function (body, JWR) {
    //   console.log('Sails responded with get sku: ', body);
    //   console.log('and with status code: ', JWR.statusCode);
    //   if(JWR.statusCode === 200){
    //     $scope.skuList = body;
    //     console.log("SKU LIST");
    //     console.log($scope.skuList);
    //     $scope.purchase.sku = $scope.skuList[0];
    //     $scope.$digest();
    //   }
    // });

    $http.get(httpHost + '/sku').success( function (data) {
      
      if(data.length !== 0){
        $scope.skuList = data;
        $scope.purchase.sku = $scope.skuList[0];
        $scope.noSKU = false;

        console.log("SKU List:");
        console.log($scope.skuList);
      }

    }).error(function (err) {
      console.log(err);
    });

  };

  var getBays = function (){
    // $http.get('http://localhost:1337/bays').success(function(data){
    // $scope.bays = data;
    // $scope.purchase.bay = $scope.bays[0];
    // });
    // io.socket.request($scope.socketOptions('get','/bays'), function (body, JWR) {
    //   console.log('Sails responded with get bays: ', body);                    
    //   console.log('and with status code: ', JWR.statusCode);
    //   if(JWR.statusCode === 200){
    //     $scope.bays = body;
    //     $scope.purchase.bay = $scope.bays[0];
    //     $scope.$digest();
    //   }
    // });
     $http.get(httpHost + '/bays').success( function (data) {
      if(data.length !== 0){
      $scope.bays = data;
      $scope.purchase.bay = $scope.bays[0];
                         
      console.log("Bays:");
      console.log($scope.bays);
      $scope.noBays = false;
      }
    }).error(function (err) {
      console.log(err);
    });
  }

  var getPurchases = function (){
    // $http.get('http://localhost:1337/purchases').success(function(data){
    //   $scope.purchasesList = data;
    // });
    // io.socket.request($scope.socketOptions('get','/purchases'), function (body, JWR) {
    //   console.log('Sails responded with get purchases: ', body);
    //   console.log('and with status code: ', JWR.statusCode);
    //   if(JWR.statusCode === 200){
    //     $scope.purchasesList = body;
    //     $scope.$digest();
    //   }
    // });
    $http.get(httpHost + '/purchases').success( function (data) {
      if(data.length !== 0){
      $scope.purchasesList = data;
      $scope.noPurchase = false;

      console.log("Purchases:");
      console.log($scope.purchasesList);
      }
    }).error(function (err) {
      console.log(err);
    });
  }
  
  getPurchases();
  getSKU();
  getBays();

  $scope.showAddPurchaseForm = function (data) {
    if($scope.viewProducts === true){
      $scope.showViewProducts(false);
    }

    $scope.addPurchaseForm = data;
    
    if(data === false){
      clearForm();
      $scope.purchases = [];
      $scope.totalCost = 0;
    }
  };


  $scope.showViewProducts = function (data) {
    if($scope.addPurchaseForm === true){
      $scope.showAddPurchaseForm(false);
    }
    $scope.viewProducts = data;
  };

  $scope.showItemExistingError = function (data, sku, bay) {
    $scope.itemExistingError = data;

    if(data === true){
      $scope.itemExisting = sku + " in bay" + bay + " is already added.";
    }else{
      $scope.itemExisting= '';
    }

  }

  $scope.combined = function (sku) {
    return sku.sku_name + ' ' + sku.size;
  }

  var clearForm = function () {
    $scope.purchase.sku = $scope.skuList[0];
    $scope.purchase.bay = $scope.bays[0];
    $scope.purchase.cases = null;
    $scope.purchase.cost = null;
    $scope.purchase.discount = null;
    $scope.purchase.prod_date = new Date();
  };

  $scope.getPurchaseProducts = function (id) {
   //  console.log(id);
   // $http.get('http://localhost:1337/purchase_products?where={"purchase_id" :'+ id +'}').success(function(data){
     // $scope.purchaseProducts = data;
     // console.log($scope.purchaseProducts);
     // $scope.showViewProducts(true);
   // });
   io.socket.request($scope.socketOptions('get','/purchase_products?where={"purchase_id" :'+ id +'}'), function (body, JWR) {
      console.log('Sails responded with get purchases: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.purchaseProducts = body;
        $scope.showViewProducts(true);
        $scope.$digest();
      }
   });
    
  };

  $scope.addPurchase = function (purchase) {
    if($scope.itemExistingError === true){
      $scope.showItemExistingError(false);
    }

    var purchaseInfo = {
      "sku_id" : purchase.sku.id,
      "bay_id" : purchase.bay.id,
      "name" : purchase.sku.sku_name + " " + purchase.sku.size,
      "company" : purchase.sku.prod_id.company,
      "bay" : purchase.bay.pile_name,
      "prod_date" : $filter('date')(purchase.prod_date, "yyyy-MM-dd HH:mm:ss"),
      "cases" : purchase.cases,
      "costpercase" : purchase.cost,
      "discountpercase" : purchase.discount,
      "amount" : purchase.cases * (purchase.cost - purchase.discount)
    };
    
    if( _.findIndex($scope.purchases,{ 'sku_id': purchaseInfo.sku_id, 'bay_id': purchaseInfo.bay_id }) === -1 ){
           $scope.purchases.push(purchaseInfo);
           $scope.totalCost += purchaseInfo.amount;
    }else{
      $scope.showItemExistingError(true,purchaseInfo.name,purchaseInfo.bay);
    }
    
    console.log("Purchases:");
    console.log($scope.purchases);

    clearForm();
  };

  $scope.deletePurchase = function (index) {
    $scope.totalCost -= $scope.purchases[index].amount;
    $scope.purchases.splice(index,1);
  };

  $scope.submitPurchases = function () {
    var purchase = {
       products : $scope.purchases,
       total_cost : $scope.totalCost,
       user : 'Sonic'
    };

    console.log();
            
    // io.socket.post('/purchases/add', {purchases : purchase});
    // $scope.totalCost = 0;
    // $scope.showAddPurchaseForm(false);

    io.socket.request($scope.socketOptions('post','/purchases/add',{},purchase), function (body, JWR) {
      console.log('Sails responded with post user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
        $scope.showAddPurchaseForm(false);
        $scope.totalCost = 0;
        $scope.$digest();
      }
    }); 

  };

  // io.socket.on('purchases', function(msg){
  // 	console.log("purchase created");
  //   console.log(msg);
  //   if (msg.verb === 'created') {
  //     console.log(msg.data);
  //     $scope.purchasesList.push(msg.data);
  //     console.log($scope.purchasesList);
  //     $scope.$digest();
  //   }
  // });

  io.socket.on('purchases', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);

    // switch (msg.verb) {
    //   case "created": 
    //     console.log("Purchase Created");
    //     $scope.users.push(msg.data);
    //     $scope.showAddUserForm(false);
    //     clearForm()
    //     $scope.$digest();
    //     break;
    //   case "destroyed":
    //     console.log("User Deleted");
    //     console.log($scope.users);
    //     var index = _.findIndex($scope.users,{'id': msg.data.id});
    //     $scope.users.splice(index,1);
    //     $scope.showEditOrDeleteUserForm(false);
    //     $scope.$digest();
    // }

    if(msg.verb === 'created'){
      console.log("Purchase Created");
      $scope.purchasesList.push(msg.data);
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
        $scope.skuList.push(msg.data);
        $scope.$digest();
        break;
      case "updated":
        console.log("SKU Updated");
        var index = _.findIndex($scope.skuList,{'id': msg.data.id});
        $scope.skuList[index] = msg.data;
        $scope.$digest();
        break;
      case "destroyed":
        console.log("SKU Deleted");
        var index = _.findIndex($scope.skuList,{'id': msg.data.id});
        $scope.skuList.splice(index,1);
        $scope.$digest();
    }
  });

  io.socket.on('bays', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);
    
    switch (msg.verb) {
      case "created": 
        console.log("Bay Created");
        $scope.bays.push(msg.data);
        $scope.$digest();
        break;
      case "updated":
        console.log("Bay Updated");
        var index = _.findIndex($scope.bays,{'id': msg.data.id});
        $scope.bays[index] = msg.data;
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Bay Deleted");
        var index = _.findIndex($scope.bays,{'id': msg.data.id});
        $scope.bays.splice(index,1);
        $scope.$digest();
    }

  });
        


}]);

