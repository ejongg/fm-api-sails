'use strict';

angular.module('fmApp')
.controller('PaymentsCtrl',['$scope','_','$http', 'httpHost', 'authService', function($scope, _, $http, httpHost, authService){
	
  $scope.deliveryTransactions = [];

  $scope.payForm = false;
  $scope.summaryForm = false;
  $scope.payment = {};
  $scope.payment.payment_date = new Date();

  $scope.noDeliveryTransactions = false;

  var getDeliveryTransactions= function () {
    $http.get(httpHost + '/delivery_transactions').success( function (data) {      
      if(data.length !== 0){
        $scope.deliveryTransactions = data;
         console.log('Delivery Transactions');
        console.log($scope.deliveryTransactions);
      }else{
        $scope.noDeliveryTransactions = true;
      }
    }).error(function (err) {
      $scope.checkError(err);
    });
  };
  
  getDeliveryTransactions();

  $scope.showPayForm = function (data) {
    $scope.payForm = data;
  };

  $scope.showSummaryForm = function (data) {
    $scope.summaryForm = data;
  };

  $scope.transactionClicked = function (data) {
    if (data.payment_date === 'Unpaid') {
      $scope.payment.delivery_id = data.id;
      $scope.showPayForm(true);
    }else {
      $scope.showSummaryForm(true);
    }
  };

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
      if(JWR.statusCode === 201){
        $scope.showPayForm(false);
        $scope.$digest();
      }
    });  
  }

 
}]);
