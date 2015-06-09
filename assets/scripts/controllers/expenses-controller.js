'use strict';

angular.module('fmApp')
.controller('ExpensesCtrl',['$scope','_','$http', 'httpHost', 'authService', function($scope, _, $http, httpHost, authService){
  $scope.expenseType = ['Utilities','Broken Empties','Breakage', 'Spoilage', 'Water', 'Electricity', 'Rent', 
                        'SSS/PhilHealth/PAGIBIG', 'Maintenance', 'Gas', 'Office Supplies'];
  $scope.skuList = [];
  $scope.bays = [];
  $scope.expenses = [];

  $scope.expense = {};
  $scope.expense.date = new Date();
  $scope.expense.prod_date = new Date();
  $scope.expense.products = [];
  $scope.expense.empties = [];
  $scope.expense.total_amount = 0;

  $scope.expenseEdit = {};

  $scope.noSKU = false;
  $scope.noBays = true;
  $scope.noExpenses = false;

  $scope.addExpenseForm = false;
  $scope.addOtherMode = true;
  $scope.addBreakageMode = false;
  $scope.addEmptiesMode = false;

  $scope.maxBottles = 0;
  $scope.companies = ['Coca-Cola', 'SMB'];

  $scope.errorMessage = '';
  $scope.hasError = false;
  $scope.itemExistingError = false;
  $scope.itemExisting = '';

  // forSorting
  $scope.sortCriteria='type';
  $scope.reverseSort = false;

  $scope.currentPage = 1;
  $scope.filteredAndSortedData = [];
  $scope.noOfRows = 0;
  $scope.newlyAdded = {};
  $scope.index = 0;

  var setPage = function(){
    console.log("NEWLY ADDED");
    console.log($scope.newlyAdded);
  
    var expenseId = $scope.newlyAdded.id;
    console.log("ID");
    console.log(expenseId);

    console.log("EXPENSES");
    console.log($scope.expenses);

    $scope.filteredAndSortedData =  $scope.sortData($scope.expenses, 'type');
   
    console.log($scope.filteredAndSortedData);

    console.log("no of rows");
    console.log($scope.noOfRows);

    $scope.index = (_.findIndex($scope.filteredAndSortedData,{'id' : expenseId}))+1;
    console.log("INDEX: " + $scope.index);

    if($scope.index < 1){
      $scope.currentPage =  1;
    }else{
      $scope.currentPage = Math.ceil($scope.index/$scope.noOfRows)
    }
    console.log("CURRENT PAGE: " + $scope.currentPage);
    console.log("INDEX: " + $scope.index);
  };
  
  var getExpenses = function () {
    console.log("GET EXPENSES");
     $http.get(httpHost + '/expenses').success( function (data) {
      if(data.length !== 0){
      $scope.expenses = data;
      console.log("Expenses:");
      console.log($scope.expenses);
      }else{
        console.log("No expenses");
        $scope.noExpenses = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  var getSKUAvailable = function () {
     console.log("GET SKU");
    $http.get(httpHost + '/sku/available').success( function (data) {
      if(data.length !== 0){
      $scope.skuList = $scope.sortData(data,'prod_id.brand_name');
      $scope.expense.sku = null;
      console.log("MAX BOTTLES:" + $scope.maxBottles);
      console.log("SKU:");
      console.log($scope.skuList);
      }else{
        console.log("NO SKU");
        $scope.noSKU = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  $scope.changeCompany = function () {
    console.log("Company Changed");
    $scope.expense.sku = null;
  };

   $scope.getBays = function (sku){
    console.log(sku.id);
    console.log("Get Bays");
     $http.get(httpHost + '/bays/list/sku-lines?id=' + sku.id).success( function (data) {
      console.log(data);
      if(data.length !== 0){
      $scope.bays = data;
      $scope.expense.bay = $scope.bays[0].id;        
      console.log("Bays:");
      console.log($scope.bays);
        $scope.noBays =false;
      }else{
        $scope.noBays = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };

  getExpenses();
  getSKUAvailable();

  $scope.pagePrint = function () {
    window.print();
  };

  $scope.getMaxBottles = function (sku){
    $scope.maxBottles = sku.bottlespercase;
    console.log("MAX BOTTLES " + $scope.maxBottles);
  };

  $scope.typeChange = function (type) {
    console.log(type);
    if(type === 'Breakage' || type === 'Spoilage'){
      $scope.addOtherMode = false;
      $scope.addBreakageMode = true;
      $scope.addEmptiesMode = false;
      $scope.addEmptiesMode = false;
      $scope.expense.date = new Date();
      $scope.expense.prod_date = new Date();
      $scope.companySelected = $scope.companies[0];
      $scope.expense.sku = null;
      $scope.expense.cases = null;
      $scope.expense.bottles = null;
      $scope.expense.total_amount = 0;
      $scope.expense.products = [];
      $scope.bays = [];
      $scope.noBays = true;
    }else if(type === 'Broken Empties'){
      $scope.addOtherMode = false;
      $scope.addBreakageMode = false;
      $scope.addEmptiesMode = true;
      $scope.companySelected = $scope.companies[0];
      $scope.expense.sku = null;
      $scope.expense.date = new Date();
      $scope.expense.return_empties_cases = null;
      $scope.expense.return_empties_bottles = null;
      $scope.expense.total_amount = 0;
      $scope.expense.empties = [];
    }else{
      $scope.addOtherMode = true;
      $scope.addBreakageMode = false;
      $scope.addEmptiesMode = false;
      $scope.expense.date = new Date();
      $scope.expense.amount = null;
    }

  };

  $scope.showErrorMessage = function (data,msg) {
       $scope.hasError = data;
       console.log($scope.hasError);
      if(data === true){
         console.log(data);
         console.log(msg);
         $scope.errorMessage = msg;
      }
    }

  $scope.showItemExistingError = function (data, sku) {
    $scope.itemExistingError = data;

    if(data === true){
      $scope.itemExisting = sku + " has been added to the existing entry.";
    }else{
      $scope.itemExisting= '';
    }

  }

  $scope.showAddExpenseForm = function (data) {
    $scope.addExpenseForm = data;
    if(data === false){
      console.log("Close");
      $scope.expense = {};
      $scope.expense.type = $scope.expenseType[0];
      $scope.expense.sku = null;
      $scope.expense.bay = null;
      $scope.expense.cases = null;
      $scope.expense.bottles = null;
      $scope.expense.date = new Date();
      $scope.expense.total_amount = 0;
      $scope.expense.products = [];
      console.log("Add Other Moder");
      console.log($scope.addOtherMode);
      if($scope.addOtherMode === false){
         $scope.addOtherMode = true;
         $scope.addBreakageMode = false;
         $scope.addEmptiesMode = false;
      }
      
    }
  };

  $scope.combine = function (sku){
    return sku.prod_id.brand_name + ' ' + sku.sku_name;
  };

  $scope.combineBay = function (bay){
    return bay.bay_name + ' ' + bay.bay_label;
  };

  $scope.addSKUToList = function (expense) {
    console.log(expense);
    var prod = {
      "bottles" : expense.bottles,
      "cases": expense.cases,
      "sku_id": expense.sku.id,
      "bottlespercase": expense.sku.bottlespercase,
      "sku": $scope.combine(expense.sku),
      "bay_id": expense.bay,
      "prod_date": $scope.formatDate(expense.prod_date),
      "amount": (expense.bottles * expense.sku.priceperbottle) + (expense.cases * expense.sku.pricepercase)
    };

    console.log($scope.expense.products);
    console.log(prod);

    if( _.findIndex($scope.expense.products,{'sku_id': prod.sku_id}) === -1 ){
           $scope.expense.products.push(prod);
           $scope.expense.total_amount += prod.amount;
           console.log(expense);
           console.log($scope.expense.products);
           console.log($scope.expense.total_amount);
    }else{
      var index = _.findIndex($scope.expense.products,{'sku_id': prod.sku_id});
      console.log(index);
      $scope.expense.products[index].cases += prod.cases;
      $scope.expense.products[index].bottles += prod.bottles;
      $scope.expense.total_amount += prod.amount;
      //$scope.showItemExistingError(true,purchaseInfo.name,purchaseInfo.bay);
    }

    $scope.expense.sku = null;
    $scope.expense.bay = $scope.bays[0].id;
    $scope.expense.cases = null;
    $scope.expense.bottles = null;

  };


  $scope.addBrokenList = function (expense) {
    console.log(expense);
    var empty = {
      "sku": expense.sku,
      "sku_id": expense.sku.id,
      "bottlespercase": expense.sku.bottlespercase,
      "return_empties_cases" : expense.return_empties_cases,
      "return_empties_bottles" : expense.return_empties_bottles,
      "amount" : (expense.return_empties_bottles * expense.sku.priceperempty) + (expense.return_empties_cases * expense.sku.bottlespercase * expense.sku.priceperempty)
    };

    console.log($scope.expense.empties);
    console.log(empty.sku_id);

    if( _.findIndex($scope.expense.empties,{'sku_id': empty.sku_id}) === -1 ){
           $scope.expense.empties.push(empty);
           $scope.expense.total_amount += empty.amount;
           console.log($scope.expense.products);
           console.log($scope.expense.total_amount);
    }else{
      var index = _.findIndex($scope.expense.empties,{'sku_id': empty.sku_id});
      $scope.expense.empties[index].return_empties_cases += empty.return_empties_cases;
      $scope.expense.empties[index].return_empties_bottles += empty.return_empties_bottles;
      $scope.expense.total_amount += empty.amount;
      //$scope.showItemExistingError(true,purchaseInfo.name,purchaseInfo.bay);
    }

    $scope.expense.sku = null;
    $scope.expense.return_empties_cases = null;
    $scope.expense.return_empties_bottles = null;

  };

  $scope.deleteSKUToList = function (index){
    console.log($scope.expense.products[index].amount);
    $scope.expense.total_amount -= $scope.expense.products[index].amount;
    $scope.expense.products.splice(index,1);
  };

  $scope.deleteEmptiesToList = function (index){
    console.log($scope.expense.empties[index].amount);
    $scope.expense.total_amount -= $scope.expense.empties[index].amount;
    $scope.expense.empties.splice(index,1);
  };

  $scope.addExpense = function (expense) {
    console.log(expense);
    var expenseInfo = {};
    if(expense.type === 'Breakage' || expense.type === 'Spoilage'){
      expenseInfo = {
      "type": expense.type,
      "amount": expense.total_amount,
      "date": $scope.formatDate(expense.date),
      "products": expense.products,
      "user" : $scope.userName
      };
    }else if(expense.type === 'Broken Empties'){
      expenseInfo = {
      "type": expense.type,
      "amount": expense.total_amount,
      "date": $scope.formatDate(expense.date),
      "empties": expense.empties,
      "user" : $scope.userName
      }
    }else{
      expenseInfo = {
      "type": expense.type,
      "amount": expense.amount,
      "date": $scope.formatDate(expense.date),
      "user" : $scope.userName
      };
    }

    console.log(expenseInfo);
    

    io.socket.request($scope.socketOptions('post','/expenses/add',{"Authorization": "Bearer " + authService.getToken()},expenseInfo), function (body, JWR) {
      console.log('Sails responded with post user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
        $scope.showAddExpenseForm(false);
        $scope.snackbarShow('Expense Added');
        $scope.expense.total_amount = 0;
      }else if (JWR.statusCode === 400){
        console.log("Error Occured");
        $scope.showErrorMessage(true,body.message);
      } 
          $scope.$digest();
    }); 

  };

  io.socket.on('bays', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);
    
    switch (msg.verb) {
      case "created": 
        if($scope.expense.sku){
          if($scope.expense.sku.id === msg.data.sku_id){
            $scope.bays.push(msg.data);
            $scope.bays = $scope.sortData($scope.bays,'bay_name');
            $scope.expense.bay = $scope.bays[0];
            if($scope.noBays === true){
              $scope.noBays = false;
            }
          }
        }
        $scope.$digest();
        break;
      case "updated":
        console.log("Bay Updated");
        if($scope.expense.sku.id === msg.data.sku_id.id){
            console.log("sku match");
            var index = _.findIndex($scope.bays,{'id': msg.data.id});
            console.log(index);
            $scope.bays[index] = msg.data;
            $scope.bays = $scope.sortData($scope.bays,'bay_name');
            $scope.expense.bay = $scope.bays[0];
        }
        $scope.$digest();
        break;
      case "destroyed":
        console.log("Bay Deleted");
        if($scope.expense.sku.id === msg.data[0].sku_id){
            console.log("sku match");
            var index = _.findIndex($scope.bays,{'id': msg.data[0].bay_id});
            $scope.bays.splice(index,1);
            if($scope.bays.length === 0){
              $scope.noBays = true;
            }else{
              $scope.bays = $scope.sortData($scope.bays,'bay_name');
              $scope.expense.bay = $scope.bays[0];
            }

        }
        $scope.$digest();

    }

  });


  io.socket.on('sku', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);

    if(msg.verb === 'updated'){   
       console.log("SKU Updated");
        if(_.findIndex($scope.skuList,{'id': msg.data.id}) !== 0){
          console.log("In SKU");
           var index =  _.findIndex($scope.skuList,{'id': msg.data.id});
           $scope.skuList[i] = msg.data;
           $scope.$digest();                         
        }
    }

  });


  io.socket.on('expenses', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);

    if(msg.verb === 'created'){
      $scope.expenses.push(msg.data);
      $scope.newlyAdded = msg.data; 
      setPage();
      if($scope.noExpenses === true){
        $scope.noExpenses = false;
      }
      $scope.$digest();
    }
    

  });


  io.socket.on('inventory', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);
    
    switch (msg.verb) {
      case "updated":
        getSKUAvailable();
        $scope.$digest();
    }

  });


}]);
