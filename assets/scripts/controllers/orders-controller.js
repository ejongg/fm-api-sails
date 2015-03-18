'use strict';

angular.module('fmApp')
.controller('OrdersCtrl',['$scope','$sailsSocket','_','$http', function($scope, $sailsSocket, _, $http){
  $scope.distanceRatings = [1,2,3,4,5];
  $scope.skuList = [];
  $scope.ordersList = [];
  $scope.orders = [];
  $scope.orderProducts = [];
  $scope.order = {};

  $scope.itemExistingError = false;
  $scope.itemExisting = '';
  $scope.addOrderForm = false;
  $scope.viewProducts = false;
  
  var getSKU = function () {
    // $http.get('http://localhost:1337/sku').success(function(data){
    //   $scope.skuList = data;
    //   $scope.order.sku = $scope.skuList[0];
    // });

    io.socket.request($scope.socketOptions('get','/sku/available'), function (body, JWR) {
      console.log('Sails responded with get customers: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.skuList = body;
        $scope.order.sku = $scope.skuList[0];
        $scope.$digest();
      }
    });
  };

  var getOrders = function (){
    // $http.get('http://localhost:1337/customer_orders').success(function(data){
    //   $scope.ordersList = data;
    // });

    io.socket.request($scope.socketOptions('get','/customer_orders'), function (body, JWR) {
      console.log('Sails responded with get customers: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.ordersList = body;
        $scope.$digest();
      }
    });
  };
  
  getOrders();
  getSKU();

  $scope.showAddOrderForm = function (data) {
    if($scope.viewProducts === true){
      $scope.showViewProducts(false);
    }
    $scope.addOrderForm = data;
    if(data === false){
      clearForm();
      $scope.orders = [];
    }
  };

  $scope.showViewProducts = function (data) {
    if($scope.addOrderForm === true){
      $scope.showAddOrderForm(false);
    }
    $scope.viewProducts = data;
  };


  $scope.showItemExistingError = function (data, item) {
    $scope.itemExistingError = data;

    if(data === true){
      $scope.itemExisting = item + " is already added.";
    }else{
      $scope.itemExisting= '';
    }

  }

  $scope.combined = function (sku) {
    return sku.sku_name + ' ' + sku.size;
  }

  var clearForm = function () {
    $scope.order.sku = $scope.skuList[0];
    $scope.order.cases = '';
  };

  $scope.getOrderProducts = function (order_id) {
   // $http.get('http://localhost:1337/customer_order_products?where={"order_id" :' + order_id +'}').success(function(data){
   //   $scope.orderProducts = data;
   // });
    io.socket.request($scope.socketOptions('get','/customer_order_products?where={"order_id" :' + order_id +'}'), function (body, JWR) {
      console.log('Sails responded with get customer orders: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.orderProducts =  body;
        $scope.$digest();
      }
    });

   $scope.showViewProducts(true);
  };

  $scope.addOrder = function (order) {
    if($scope.itemExistingError === true){
      $scope.showItemExistingError(false);
    }

    var orderInfo = {
      "sku_id" : order.sku.id,
      "sku" : order.sku.sku_name + " " + order.sku.size,
      "cases" : order.cases
    };
    
    if(_.findIndex($scope.orders, function(order) { return order.sku_id === orderInfo.sku_id; }) === -1){
           $scope.orders.push(orderInfo);
    }else{
      $scope.showItemExistingError(true,orderInfo.sku);
    }

    clearForm();
  };

  $scope.deleteOrder = function (index) {
    $scope.orders.splice(index,1);
  };

  $scope.submitOrders = function () {
    var final_order = {
      customer : {
          "establishment" : $scope.order.establishment,
          "owner" : $scope.order.owner,
          "address" : $scope.order.address,
          "distance" : $scope.order.distance_rating
      },
      
      "orders" : $scope.orders,
      "cokeagent_name" : $scope.order.cokeagent_name,
      "user" : 'Sonic'
    };

    console.log(final_order);

    // io.socket.post('/customer_orders/add', {order : final_order});
    io.socket.request($scope.socketOptions('post','/customer_orders/add',{},final_order), function (body, JWR) {
      console.log('Sails responded with post user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
      
      }
    });  

    $scope.showAddOrderForm(false);

  };

  // io.socket.on('customer_orders', function(msg){
  //   console.log('customer order created');
  //   console.log(msg.verb);
  //   if (msg.verb === 'created') {
  //     console.log(msg.data);
  //     $scope.ordersList.push(msg.data);
  //     console.log($scope.ordersList);
  //     $scope.$digest();
  //   }
  // });

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
  
  io.socket.on('customer_orders', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);

    switch (msg.verb) {
      case "created": 
        console.log("Customer Order Created");
        console.log(msg.data);
        $scope.ordersList.push(msg.data);
        console.log($scope.ordersList);
        $scope.$digest();
    }

  });  


}]);

