'use strict';

angular.module('fmApp')
.controller('BadOrdersCtrl',['$scope','_','$http','httpHost', 'authService', function($scope, _, $http, httpHost, authService){
  $scope.skuList = [];
  $scope.bays = [];
  $scope.badOrdersList = [];
  $scope.employees = [];
  $scope.badOrderDetails = {};
  $scope.products = [];
  $scope.product = {};
  $scope.badOrderProducts = [];
  $scope.totalExpense = 0;
  $scope.accountable = '';

  $scope.itemExistingError = false;
  $scope.itemExisting = '';
  $scope.addBadOrderForm = false;
  $scope.viewBadOrderDetails = false;

  $scope.noBadOrders = false;
  $scope.noBays = true;
  $scope.noSKU = false;
  $scope.noEmployees = false;

  $scope.errorMessage = '';
  $scope.hasError = false;

  $scope.companies = ['Coca-Cola', 'SMB'];

  // forSorting
  $scope.sortCriteria='id';
  $scope.reverseSort = false;

  var getBadOrderList = function () {
    $http.get(httpHost + '/bad_orders').success( function (data) {
      console.log("Get Bad Orders");
      if(data.length !== 0){
        $scope.badOrdersList = data;
        console.log("Bad Orders:");
        console.log($scope.badOrdersList);
      }else{
        $scope.noBadOrders = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  $scope.getBays = function (sku){
    console.log(sku);
    console.log(sku.id);
    console.log("Get Bays");
     $http.get(httpHost + '/bays/list/sku-lines?id=' + sku.id).success( function (data) {
      if(data.length !== 0){
      $scope.bays = data;
      $scope.product.bay = $scope.bays[0];        
      console.log("Bays:");
      console.log($scope.bays);
        $scope.noBays =false;
      }else{
        console.log("No Bays");
        $scope.noBays = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  $scope.changeCompany = function () {
    console.log("Company Changed");
    $scope.product.sku = null;
  };
  
  var getSKU = function () {
  console.log("SKU GET");
    $http.get(httpHost + '/sku/available').success( function (data) {
      if(data.length !== 0){
        $scope.skuList = $scope.sortData(data,'prod_id.brand_name');
        $scope.product.sku = null;
        console.log("SKU:");
        console.log($scope.skuList);
      }else{
        $scope.noSKU = false;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  var getEmployee = function () {
    console.log("EMPLOYEE GET");
    $http.get(httpHost + '/employees').success( function (data) {
      if(data.length !== 0){
        $scope.employees = $scope.sortData(data,'emp_fname');
        $scope.accountable = $scope.employees[0];
        console.log("Employees:");
        console.log($scope.employees);
      }else{
        $scope.noEmployees = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  getBadOrderList();
  getSKU();
  getEmployee();
  
  $scope.pagePrint = function () {
    window.print();
  };

  $scope.fullName = function (employee) {
    return employee.emp_fname + ' ' + employee.emp_lname;
  };

  $scope.showErrorMessage = function (data,msg) {
     $scope.hasError = data;
     console.log($scope.hasError);
    if(data === true){
       console.log(data);
       console.log(msg);
       $scope.errorMessage = msg;
       clearForm();
    }
  }

  $scope.showAddBadOrderForm = function (data) {
    $scope.badOrderForm.$setPristine();
    $scope.hasError = false;
    if($scope.viewBadOrderDetails === true){
      $scope.showViewBadOrderDetails(false);
    }

    $scope.addBadOrderForm= data;
    if(data === false){
      clearForm();
      $scope.totalExpense = 0;
      $scope.products = [];
    }
  };

  $scope.showItemExistingError = function (data, sku, bay) {
    $scope.itemExistingError = data;

    if(data === true){
      $scope.itemExisting = sku + " in Bay " + bay + " is already added.";
    }else{
      $scope.itemExisting= '';
    }

  }

  $scope.showViewBadOrderDetails = function (data) {
    if($scope.addBadOrderForm === true){
      $scope.showAddBadOrderForm(false);
    }

    $scope.viewBadOrderDetails = data;
  };

  $scope.combine = function (sku) {
    return sku.prod_id.brand_name + ' '+ sku.sku_name + ' ' + sku.size;
  }

  $scope.combineBay = function (bay){
    return bay.bay_name + ' ' + bay.bay_label;
  };

  var clearForm = function () {
    $scope.badOrderForm.$setPristine();
    $scope.product.sku = null;
    $scope.product.cases = null;
    $scope.product.bottles = null;
    $scope.product.reason = "";
  };

  $scope.getBadOrderDetails = function (id) {
   $http.get(httpHost + '/bad_order_details?where={"bad_order_id" :'+ id +'}').success( function (data) {
     $scope.badOrderDetails = data;
     console.log(data);
     $scope.showViewBadOrderDetails(true);
   }).error(function (err) {
      console.log(err);
   });
    
  };

  $scope.addProduct = function (product) {
    if($scope.itemExistingError === true){
      $scope.showItemExistingError(false);
    }

    var productInfo = {
      "sku_id" : product.sku.id,
      "bay_id" : product.bay.id,
      "sku_name" : product.sku.sku_name + " " + product.sku.size,
      "bottlespercase" : product.sku.bottlespercase,
      "expense" : (product.cases * product.sku.pricepercase) + (product.bottles * product.sku.priceperbottle),
      "cases" : product.cases,
      "bottles" : product.bottles,
      "reason" : product.reason
    };
    console.log(product);
    console.log("Product Info:");
    console.log(productInfo);

 
    if( _.findIndex($scope.products,{ 'sku_id': productInfo.sku_id, 'bay_id': productInfo.bay_id }) === -1 ){
      $scope.products.push(productInfo);
      $scope.totalExpense += productInfo.expense;
    }else{
      $scope.showItemExistingError(true,productInfo.sku_name , product.bay.pile_name);
    }

    clearForm();
  };

  $scope.deleteProduct= function (index) {
    $scope.totalExpense -= $scope.products[index].expense;
    $scope.products.splice(index,1);
  };
  
  $scope.submitBadOrders = function () {
    var badOrder = {
      "products" : $scope.products,
      "total_expense" : $scope.totalExpense,
      "accountable" : $scope.accountable.emp_fname + ' ' + $scope.accountable.emp_lname
    };
    console.log("Bad Order");
    console.log(badOrder);

    io.socket.request($scope.socketOptions('post','/bad_orders/add',{"Authorization": "Bearer " + authService.getToken()},badOrder), function (body, JWR) {
      console.log('Sails responded with post bad order: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
        $scope.snackbarShow('Bad Order Added');
        $scope.showAddBadOrderForm(false);
      }else if (JWR.statusCode === 400){
        console.log("Error Occured");
        $scope.showErrorMessage(true,body);
      } 
        $scope.$digest();
    }); 

  };

  io.socket.on('bad_orders', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);
    
    switch (msg.verb) {
      case "created": 
        console.log("Bad Order Created");
        $scope.badOrdersList.push(msg.data);
        if($scope.noBadOrders === true){
          console.log("set no bad orders to false");
          $scope.noBadOrders = false;
        }
        $scope.$digest();
    }

  });

    io.socket.on('employees', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);

    switch (msg.verb) {
      case "created": 
        console.log("Employee Created");
        $scope.employees.push(msg.data);
        $scope.employees =  $scope.sortData($scope.employees,'emp_fname');
        $scope.accountable = $scope.employees[0];
        if($scope.noEmployees === true){
          $scope.noEmployees = false;
        }
        $scope.$digest();
        break;
      case "updated":
        console.log("Employee Updated");
        var index = _.findIndex($scope.employees,{'id': msg.data.id});
        console.log(index);
        $scope.employees[index] = msg.data;
        $scope.employees =  $scope.sortData($scope.employees,'emp_fname');
        $scope.accountable = $scope.employees[0];   
        console.log(msg.data);
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Employee Deleted");
        console.log(msg.data[0].emp_id);
        var index = _.findIndex($scope.employees,{'id': msg.data[0].emp_id});
        console.log(index);
        $scope.employees.splice(index,1);
        $scope.employees =  $scope.sortData($scope.employees,'emp_fname');
        $scope.accountable = $scope.employees[0];
        if($scope.employees.length === 0){
          $scope.noEmployees = true;
        }
        $scope.$digest();
    }

  });

  // io.socket.on('bays', function(msg){
  //   console.log("Message Verb: " + msg.verb);
  //   console.log("Message Data :");
  //   console.log(msg.data);
    
  //   switch (msg.verb) {
  //     case "created": 
  //       console.log("Bay Created");
  //       $scope.bays.push(msg.data);
  //       if($scope.noBays === true){
  //         $scope.noBays = false;
  //       }
  //       $scope.product.bay = $scope.bays[0];
  //       $scope.$digest();
  //       break;
  //     case "updated":
  //       console.log("Bay Updated");
  //       var index = _.findIndex($scope.bays,{'id': msg.data.id});
  //       $scope.bays[index] = msg.data;
  //       $scope.product.bay = $scope.bays[0];
  //       $scope.$digest();
  //       break;
  //     case "destroyed":
  //       console.log("Bay Deleted");
  //       var index = _.findIndex($scope.bays,{'id': msg.data[0].bay_id});
  //       $scope.bays.splice(index,1);
  //       if($scope.bays.length === 0){
  //         $scope.noBays = true;
  //         if($scope.addBadOrderForm === true){
  //           console.log("Close form");
  //           $scope.addBadOrderForm = false;
  //         }
  //       }else{
  //         $scope.product.bay = $scope.bays[0];
  //       }
  //       $scope.$digest();

  //   }

  // });

io.socket.on('inventory', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);
    
    switch (msg.verb) {
      case "updated":
        console.log("Bay Updated");
        getBays();
        getSKU();
        // var index = _.findIndex($scope.bays,{'id': msg.data.id});
        // $scope.bays[index] = msg.data;
        // $scope.product.bay = $scope.bays[0];
        $scope.$digest();
    }

  });


}]);

