'use strict';

angular.module('fmApp')
.controller('OrdersCtrl',['$scope','_','$http','httpHost', 'authService','userService', function($scope, _, $http, httpHost, authService,userService){
  $scope.distanceRatings = [1,2,3,4,5];
  $scope.skuList = [];
  $scope.ordersList = [];
  $scope.orders = [];
  $scope.orderProducts = [];
  $scope.order = {};
  $scope.totalAmount = 0;

  $scope.itemExistingError = false;
  $scope.itemExisting = '';
  $scope.addOrderForm = false;
  $scope.viewProducts = false;
  
  $scope.totalAmountView = 0;

  $scope.noSKU = true;
  $scope.noOrders = true;

  // forSorting
  $scope.sortCriteria = '';
  
  var getSKU = function () {
    // $http.get('http://localhost:1337/sku').success(function(data){
    //   $scope.skuList = data;
    //   $scope.order.sku = $scope.skuList[0];
    // });

    // io.socket.request($scope.socketOptions('get','/sku/available'), function (body, JWR) {
    //   console.log('Sails responded with get sku available: ', body);
    //   console.log('and with status code: ', JWR.statusCode);
    //   if(JWR.statusCode === 200){
    //     $scope.skuList = body;
    //     $scope.order.sku = $scope.skuList[0];
    //     $scope.$digest();
    //   }
    // });

    $http.get(httpHost + '/sku').success( function (data) {
      if(data.length !== 0){
        $scope.skuList = data;
        $scope.noSKU = false;
        $scope.order.sku = $scope.skuList[0];
        console.log("SKU:");
        console.log($scope.skuList);
      }
    }).error(function (err) {
      console.log(err);
    });

  };

  var getOrders = function (){
    // $http.get('http://localhost:1337/customer_orders').success(function(data){
    //   $scope.ordersList = data;
    // });

    // io.socket.request($scope.socketOptions('get','/customer_orders'), function (body, JWR) {
    //   console.log('Sails responded with get customers orders: ', body);
    //   console.log('and with status code: ', JWR.statusCode);
    //   if(JWR.statusCode === 200){
    //     $scope.ordersList = body;
    //     $scope.$digest();
    //   }
    // });

    $http.get(httpHost + '/customer_orders').success( function (data) {
      if(data.length !== 0){
         $scope.ordersList = data;
        $scope.noOrders = false;

        console.log("Orders:");
        console.log($scope.ordersList);
      }
    }).error(function (err) {
      console.log(err);
    });

  };
  
  getOrders();
  getSKU();

  $scope.pagePrint = function () {
    window.print();
  };

  $scope.showAddOrderForm = function (data) {
    if($scope.viewProducts === true){
      $scope.showViewProducts(false);
    }
    $scope.addOrderForm = data;
    if(data === false){
      clearForm();
      $scope.orders = [];
      $scope.totalAmount = 0;
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
    $scope.orderForm.$setPristine();
    $scope.order.distance_rating = $scope.distanceRatings[0];
    $scope.order.sku = $scope.skuList[0];
    $scope.order.cases = null;
  };

  $scope.getOrderProducts = function (order_id) {
   // $http.get('http://localhost:1337/customer_order_products?where={"order_id" :' + order_id +'}').success(function(data){
   //   $scope.orderProducts = data;
   // });
    // io.socket.request($scope.socketOptions('get','/customer_order_products?where={"order_id" :' + order_id +'}'), function (body, JWR) {
    //   console.log('Sails responded with get customer orders: ', body);
    //   console.log('and with status code: ', JWR.statusCode);
    //   if(JWR.statusCode === 200){
    //     $scope.orderProducts =  body;
    //     $scope.$digest();
    //   }
    // });

    $http.get(httpHost + '/customer_order_products?where={"order_id" :' + order_id +'}').success( function (data) {  
      $scope.orderProducts = data;
      console.log("Order Products");
      console.log(data);
      console.log(data[0].order_id);
      $scope.totalAmountView = data[0].order_id.total_amount;
      $scope.showViewProducts(true);
    }).error(function (err) {
      console.log(err);
    });

  };

  $scope.addOrder = function (order) {
    if($scope.itemExistingError === true){
      $scope.showItemExistingError(false);
    }

    var orderInfo = {
      "sku_id" : order.sku.id,
      "sku" : order.sku.sku_name + " " + order.sku.size,
      "cases" : order.cases,
      "price" : order.sku.pricepercase * order.cases
    };

    console.log(order);
    console.log(orderInfo);
    
    if(_.findIndex($scope.orders, function(order) { return order.sku_id === orderInfo.sku_id; }) === -1){
           $scope.orders.push(orderInfo);
           $scope.totalAmount += orderInfo.price;
          
    }else{
      $scope.showItemExistingError(true,orderInfo.sku);
    }

    clearForm();
  };

  $scope.deleteOrder = function (index) {
    $scope.totalAmount -= $scope.orders[index].price; 
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
      "supplieragent_name" : $scope.order.cokeagent_name,
      "user" : userService.getUserName(),
      "total_amount": $scope.totalAmount

    };

    console.log(final_order);

    // io.socket.post('/customer_orders/add', {order : final_order});
    io.socket.request($scope.socketOptions('post','/customer_orders/add',{"Authorization": "Bearer " + authService.getToken()},final_order), function (body, JWR) {
      console.log('Sails responded with post user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
       console.log("close form");
       $scope.showAddOrderForm(false);
       $scope.$digest();
      }
    });  

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
        if($scope.noSKU === true){
          $scope.noSKU = false;
        }
        $scope.order.sku = $scope.skuList[0];
        $scope.$digest();
        break;
      case "updated":
        console.log("SKU Updated");
        var index = _.findIndex($scope.skuList,{'id': msg.data.id});
        $scope.skuList[index] = msg.data;
        $scope.order.sku = $scope.skuList[0];
        $scope.$digest();
        break;
      case "destroyed":
        console.log("SKU Deleted");
        var index = _.findIndex($scope.skuList,{'id': msg.data[0].sku_id});
        $scope.skuList.splice(index,1);
        if($scope.skuList.length === 0){
          $scope.noSKU = true;
          if($scope.addOrderForm === true){
            console.log("Close form");
            $scope.addOrderForm = false;
          }
        }else{
          $scope.order.sku = $scope.skuList[0];
        }
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
        if($scope.noOrders === true) {
          $scope.noOrders = false;
        }
        $scope.$digest();
    }

  });  


}]);

