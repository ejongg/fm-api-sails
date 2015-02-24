'use strict';

angular.module('fmApp')
.controller('SKUCtrl',['$scope','$sailsSocket','_','$filter', function($scope, $sailsSocket, _,$filter){
	$scope.products = [];
	$scope.existingProducts = [];
	$scope.companyFilter = {};
	$scope.sku = {};

	var getProducts = function (){  
      $sailsSocket.get('/products').success(function (data) {
      $scope.products = data;
      // console.log($scope.products);
      $scope.existingProducts = _.uniq($scope.products,'company');
      //console.log($scope.existingProducts);
      $scope.companyFilter = $scope.existingProducts[0].company;
      $scope.sku.prod_name = $scope.products[0].prod_name;
      //console.log($scope.sku);
      //console.log($scope.products[0].prod_name);
      $scope.sku.company = _.result(_.find($scope.products, function(chr) { return chr.prod_name === $scope.sku.prod_name; }), 'company');
      console.log($scope.sku.company);
      }).error(function (err) {
      console.log(err);
      });
    };
    
    getProducts();

    $scope.addSKU = function (data) {
      console.log(data);
    };

  $scope.selectCompany = function (product){
    $scope.sku.company = _.result(_.find($scope.products, function(chr) { return chr.prod_name === product; }), 'company');
  }

    // $scope.sku.company = $scope.sku.prod_name
  
   

    $sailsSocket.subscribe('products', function(msg){

	    if(msg.verb === 'created'){
	      
	      if(_.findIndex($scope.existingProducts, function(prod) { return prod.company == msg.data.company; }) === -1){
	        $scope.existingProducts.push(msg.data);
	      }

	      $scope.products.push(msg.data);
	    }

    });

}]);
