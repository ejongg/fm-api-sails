'use strict';

angular.module('fmApp')
.controller('SKUCtrl',['$scope','$sailsSocket','_','$filter', function($scope, $sailsSocket, _,$filter){
	$scope.products = [];
	$scope.existingCompany = [];
	$scope.companyFilter = {};
	$scope.sku = {};
  $scope.units = ["L","oz"];
  
  $scope.noExistingProduct = false;

	var getProducts = function (){  
      $sailsSocket.get('/products').success(function (data) {
      $scope.products = data;

      if($scope.products.length === 0){
        $scope.noExistingProduct = true;
      }else{
        // console.log($scope.products);
        $scope.existingCompany = _.uniq($scope.products,'company');
        //console.log($scope.existingProducts);
        $scope.companyFilter = $scope.existingCompany[0].company;
        $scope.sku.prod_name = $scope.products[0].prod_name;
        //console.log($scope.sku);
        //console.log($scope.products[0].prod_name);
      }
      }).error(function (err) {
      console.log(err);
      });
  };
    
  getProducts();

  $scope.addSKU = function (data) {
      console.log(data);
  };


    $sailsSocket.subscribe('products', function(msg){

	    if(msg.verb === 'created'){
	      
	      if(_.findIndex($scope.existingProducts, function(prod) { return prod.company == msg.data.company; }) === -1){
	        $scope.existingProducts.push(msg.data);
	      }

	      $scope.products.push(msg.data);
	    }

    });

}]);
