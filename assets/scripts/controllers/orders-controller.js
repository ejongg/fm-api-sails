'use strict';

angular.module('fmApp')
.controller('OrdersCtrl',['$scope','_','$http','httpHost', 'authService','userService','$modal', 
  function($scope, _, $http, httpHost, authService,userService,$modal){
  $scope.distanceRatings = [1,2,3,4,5];
  $scope.skuList = [];
  $scope.ordersList = [];
  $scope.addresses = [];
  $scope.orders = [];
  $scope.orderProducts = [];
  $scope.order = {};
  $scope.order.address = '';
  $scope.totalAmount = 0;

  $scope.itemExistingError = false;
  $scope.itemExisting = '';
  $scope.addOrderForm = false;
  $scope.viewProducts = false;
  
  $scope.totalAmountView = 0;

  $scope.noSKU = false;
  $scope.noOrders = false;
  $scope.noAddresses = false;

  // forSorting
  $scope.sortCriteria='id';
  $scope.reverseSort = false;
  
  $scope.companies = ['Coca-Cola', 'SMB'];

  var getSKU = function () {
    $http.get(httpHost + '/sku').success( function (data) {
      if(data.length !== 0){
        $scope.skuList = $scope.sortData(data,'prod_id.brand_name');
        $scope.order.sku = null;
        console.log("SKU:");
        console.log($scope.skuList);
      }else{
        $scope.noSKU = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });

  };

  var getOrders = function (){
    $http.get(httpHost + '/customer_orders').success( function (data) {
      if(data.length !== 0){
         $scope.ordersList = data;
        console.log("Orders:");
        console.log($scope.ordersList);
      }else{
        $scope.noOrders = true;
      }
    }).error(function (err) {
      console.log(err);
    });

  };

  var getAddresses = function (){
    $http.get(httpHost + '/address').success( function (data) {
      if(data.length !== 0){
        $scope.addresses = $scope.sortData(data,'address_name');
        console.log("Addresses:");
        console.log($scope.addresses);
        $scope.order.address = $scope.addresses[0].address_name;
      }else{
        $scope.noAddresses = true;
      }
    }).error(function (err) {
      console.log(err);
    });

  };
  
  getOrders();
  getSKU();
  getAddresses();

  $scope.changeCompany = function (company) {
    console.log(company);
    if(company === 'SMB'){
      $scope.order.sku = null;
    }else{
      $scope.order.sku = null;
    }
  };

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

  $scope.combine = function (sku) {
    return sku.prod_id.brand_name + ' ' + sku.sku_name + ' ' + sku.size  ;
}

  var clearForm = function () {
    $scope.orderForm.$setPristine();
    $scope.order.distance_rating = $scope.distanceRatings[0];
    $scope.order.sku = null;
    $scope.order.address = $scope.addresses[0].address_name;
    $scope.order.cases = null;
    $scope.order.establishment = '';
    $scope.order.owner = '';
    $scope.order.cokeagent_name = ''; 
    $scope.companySelected = $scope.companies[0]       
  };

  $scope.getOrderProducts = function (order_id,status) {

    $http.get(httpHost + '/customer-orders/details?id=' + order_id).success( function (data) {  
      console.log(data);
    //   console.log(data.total_amount);
    //   $scope.orderProducts.products = data.products;
    //   console.log("Order Products");
    //   $scope.totalAmountView = data.total_amount;
    //   $scope.showViewProducts(true);
    //   $scope.orderProducts.order_id = data.id;
     data.status = status;
      $scope.open(data);
    }).error(function (err) {
      console.log(err);
    });

  };

  $scope.getOwnerName = function ($item, $model, $label) {
    $scope.order.owner = $item.customer_id.owner_name;
  };

  $scope.addOrder = function (order) {
    if($scope.itemExistingError === true){
      $scope.showItemExistingError(false);
    }
    $scope.orderForm.$setPristine();
    var orderInfo = {
      "sku_id" : order.sku.id,
      "sku" : order.sku.sku_name + " " + order.sku.size,
      "cases" : order.cases,
      "price" : order.sku.pricepercase * order.cases,
      "bottlespercase": order.sku.bottlespercase,
      "listName": order.sku.prod_id.brand_name +" "+ order.sku.sku_name + " " + order.sku.size
    };

    console.log(order);
    console.log(orderInfo);
    
    if(_.findIndex($scope.orders, function(order) { return order.sku_id === orderInfo.sku_id; }) === -1){
           $scope.orders.push(orderInfo);
           $scope.totalAmount += orderInfo.price;
           $scope.order.sku = $scope.skuList[0];
    }else{
      var index = _.findIndex($scope.orders, function(order) { return order.sku_id === orderInfo.sku_id; });
      $scope.orders[index].cases += orderInfo.cases;
      $scope.totalAmount += orderInfo.price;
      $scope.showItemExistingError(true,orderInfo.sku);
    }

    $scope.order.cases = null;
    $scope.order.sku = $scope.skuList[0];
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

    //io.socket.post('/customer_orders/add', {order : final_order});
    io.socket.request($scope.socketOptions('post','/customer_orders/add',{"Authorization": "Bearer " + authService.getToken()},final_order), function (body, JWR) {
      console.log('Sails responded with post user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
       console.log("close form");
       $scope.showAddOrderForm(false);
       $scope.snackbarShow('Order Added');
       $scope.$digest();
      }
    });  

  };

  io.socket.on('sku', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);
    
    switch (msg.verb) {
      case "created": 
        console.log("SKU Created");
        $scope.skuList.push(msg.data);
        $scope.skuList = $scope.sortData($scope.skuList,'prod_id.brand_name');
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
        $scope.skuList = $scope.sortData($scope.skuList,'prod_id.brand_name');
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
          $scope.skuList = $scope.sortData($scope.skuList,'prod_id.brand_name');
          $scope.order.sku = $scope.skuList[0];
        }
        $scope.$digest();
    }

  });

  io.socket.on('address', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);

    switch (msg.verb) {
      case "created": 
        console.log("Address Created");
        $scope.addresses.push(msg.data);
        $scope.addresses = $scope.sortData($scope.addresses,'address_name');
        $scope.order.address = $scope.addresses[0].address_name;
         if($scope.noAddresses === true){
          $scope.noAddresses = false;
        } 
        $scope.$digest();
        break;
      case "updated": 
        console.log("Address Updated");
        var index = _.findIndex($scope.addresses,{'id': msg.data[0].id});
        console.log(index);
        $scope.addresses[index] = msg.data[0];   
        $scope.addresses = $scope.sortData($scope.addresses,'address_name');
        $scope.order.address = $scope.addresses[0].address_name;
        console.log(msg.data);
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Address Deleted");
        console.log(msg.data[0]);
        var index = _.findIndex($scope.addresses,{'id': msg.data[0].address_id});
        console.log(index);
        $scope.addresses.splice(index,1);
        $scope.addresses = $scope.sortData($scope.addresses,'address_name');
        $scope.order.address = $scope.addresses[0].address_name;
        if($scope.addresses.length === 0){
          $scope.noAddresses = true;
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


   $scope.open = function (order) {
    console.log("Open Modal");
    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'orderDetailsModal.html',
      controller: 'OrderModalCtrl',
      resolve: {
        order : function () {
          return order;
        }
      }
    });


    modalInstance.result.then(function (cancelInfo) {
      console.log(cancelInfo);

      io.socket.request($scope.socketOptions('post','/customer-orders/cancel',{"Authorization": "Bearer " + authService.getToken()}, cancelInfo), function (body, JWR) {
      console.log('Sails responded with post user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.snackbarShow('Order Cancelled');  
      }else if (JWR.statusCode === 400){
        console.log("Error Occured");
        $scope.snackbarShow('Order Cancel Error');  
      }
       $scope.$digest();
    
      });
    }, function () {
      console.log("close");
    });

  };

}])

.controller('OrderModalCtrl', function ($scope, $modalInstance, order) {
  $scope.cancelMode = false;
  $scope.orderProducts = order;
  $scope.cancel = {};
  console.log($scope.orderProducts);
  
  $scope.closeForm = function () {
    console.log("Close Form");
    $scope.cancelMode = false;
    $scope.cancel = {};
  }

  $scope.ok = function (cred) {
    var cancelInfo = {
      "order_id": order.id,
      "username": cred.username,
      "password": cred.password
    }
    $modalInstance.close(cancelInfo);
  };

  $scope.closeModal = function () {
    $modalInstance.dismiss('cancel');
  }
});





