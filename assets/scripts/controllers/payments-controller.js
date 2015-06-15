'use strict';

angular.module('fmApp')
.controller('PaymentsCtrl',['$scope','_','$http', 'httpHost', 'authService', function($scope, _, $http, httpHost, authService){
	
  $scope.deliveryTransactions = [];

  $scope.payForm = false;
  $scope.summaryForm = false;
  $scope.payment = {};
  $scope.payment.payment_date = new Date();
  $scope.summary = {};
  $scope.historyData = [];
  $scope.paymentDateFilter = new Date();

  // forSorting
  $scope.sortCriteria='id';
  $scope.reverseSort = false;
  $scope.noHistory = false;



  $scope.noDeliveryTransactions = false;

  var getDeliveryTransactions= function (date) {
    console.log($scope.formatDate(date));
    $http.get(httpHost + '/delivery/available-payments?date='+ $scope.formatDate(date)).success( function (data) {      
      if(data.length !== 0){
        $scope.deliveryTransactions = data;
         console.log('Delivery Transactions');
        console.log($scope.deliveryTransactions);
        $scope.noDeliveryTransactions = false;
      }else{
        console.log('No Delivery Transactions');
        $scope.noDeliveryTransactions = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };
  
  getDeliveryTransactions($scope.paymentDateFilter);

  var clearForm = function () {
    $scope.payment.payment_date = new Date();
      $scope.payment.paid_amount = 0;     
  };

  $scope.showPayForm = function (data) {
    $scope.payForm = data;
    if(data === false){
      $scope.payment.payment_date = new Date();
      $scope.payment.paid_amount = 0;
       clearForm();
    }

  };

  $scope.dateFilterChange = function (date) {
    console.log(date);
    getDeliveryTransactions(date);
  };

  $scope.showSummaryForm = function (data) {
    $scope.summaryForm = data;
  };

  $scope.transactionClicked = function (data) {
    if (data.payment_date === 'Unpaid') {
      $scope.payment.delivery_id = data.id;
      $scope.payment.customer = data.customer_id.owner_name;
      $scope.payment.establishment = data.customer_id.establishment_name;
      $scope.showPayForm(true);
      $scope.showSummaryForm(false);
    }else {
      $scope.summary = data;
      $scope.showSummaryForm(true);
      $scope.showPayForm(false);
    }
  };

  $scope.getPaymentHistory = function (transaction) {
    console.log(transaction);
    $http.get(httpHost + '/payments?where={"delivery_id":'+transaction.id+'}').success( function (data) {      
      if(data.length !== 0){
        $scope.historyData = data;
         console.log('History Data');
        console.log($scope.historyData);
      }else{
        console.log("No History");
        $scope.noHistory = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  }

  $scope.addPayment = function (data) {
    console.log(data);
    var paymentInfo = {
      "payment_date" : $scope.formatDate(data.payment_date),
      "delivery_id" : data.delivery_id,
      "paid_amount" : data.paid_amount
    };
    
    console.log(paymentInfo);
    io.socket.request($scope.socketOptions('post','/delivery_transactions/payments',{"Authorization": "Bearer " + authService.getToken()},paymentInfo), function (body, JWR) {
      console.log('Sails responded with post user: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.showPayForm(false);
        $scope.snackbarShow('Payment Added');
        $scope.$digest();
      }
    });  
  }

  io.socket.on('delivery_transactions', function(msg){
    console.log("Message Verb: " + msg.verb);
    console.log("Message Data :");
    console.log(msg.data);

    switch (msg.verb) {
      case "paid": 
        console.log(msg.data);
        var index = _.findIndex($scope.deliveryTransactions,{'id': msg.data.id});
        $scope.deliveryTransactions[index] = msg.data;
        break;
      case "for-payment":
      if(msg.data.delivery_date === $scope.formatDate($scope.paymentDateFilter)){
        console.log("Same Date");
        $scope.deliveryTransactions.push(msg.data);
      }
    }

    $scope.$digest();
  });
 
}]);
