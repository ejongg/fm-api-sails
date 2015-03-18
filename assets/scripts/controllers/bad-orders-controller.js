'use strict';

angular.module('fmApp')
.controller('BadOrdersCtrl',['$scope','$sailsSocket','_','$http', function($scope, $sailsSocket, _, $http){
  $scope.skuList = [];
  $scope.bays = [];
  $scope.badOrdersList = [];
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

  var getBadOrderList = function () {
    io.socket.request($scope.socketOptions('get','/bad_orders'), function (body, JWR) {
      console.log('Sails responded with get bad orders: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.badOrdersList = body;
        console.log($scope.badOrdersList);
        $scope.$digest();
      }
    });
  };

  var getBays = function (){
    io.socket.request($scope.socketOptions('get','/bays'), function (body, JWR) {
      console.log('Sails responded with get bays: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.bays = body;
        $scope.product.bay = $scope.bays[0];
        $scope.$digest();
      }
    });
  }
  
  var getSKU = function () {
    io.socket.request($scope.socketOptions('get','/sku/available'), function (body, JWR) {
      console.log('Sails responded with get sku: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.skuList = body;
        $scope.product.sku = $scope.skuList[0];
        $scope.$digest();
      }
    });
  };

  getBadOrderList();
  getBays();
  getSKU();

  $scope.showAddBadOrderForm = function (data) {
    if($scope.viewBadOrderDetails === true){
      $scope.showViewBadOrderDetails(false);
    }

    $scope.addBadOrderForm= data;
    if(data === false){
      clearForm();
      $scope.totalExpense = 0;
      $scope.accountable = '';
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

  $scope.combined = function (sku) {
    return sku.sku_name + ' ' + sku.size;
  }

  var clearForm = function () {
    $scope.product.sku = $scope.skuList[0];
    $scope.product.cases = null;
    $scope.product.reason = '';
  };

  $scope.getBadOrderDetails = function (id) {
   //  console.log(id);
   // $http.get('http://localhost:1337/purchase_products?where={"purchase_id" :'+ id +'}').success(function(data){
     // $scope.purchaseProducts = data;
     // console.log($scope.purchaseProducts);
     // $scope.showViewProducts(true);
   // });
   io.socket.request($scope.socketOptions('get','/bad_order_details?where={"bad_order_id" :'+ id +'}'), function (body, JWR) {
      console.log('Sails responded with get bad order details: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 200){
        $scope.badOrderDetails = body;
        $scope.showViewBadOrderDetails(true);
        $scope.$digest();
      }
   });
    
  };

  $scope.addProduct = function (product) {
    if($scope.itemExistingError === true){
      $scope.showItemExistingError(false);
    }
    // console.log(product);

    // var product = {
    //             sku_id : $scope.selectedSku.id, 
    //             sku_name : $scope.selectedSku.sku_name,
    //             expense : $scope.cases * ($scope.selectedSku.price * $scope.selectedSku.bottlespercase),
    //             cases : $scope.cases,
    //             reason : $scope.reason,
    //         };

    var productInfo = {
      "sku_id" : product.sku.id,
      "bay_id" : product.bay.id,
      "sku_name" : product.sku.sku_name + " " + product.sku.size,
      "bottlespercase" : product.sku.bottlespercase,
      "expense" : product.cases * (product.sku.price * product.sku.bottlespercase),
      "cases" : product.cases,
      "reason" : product.reason
    };
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
      "accountable" : $scope.accountable
    };
    console.log("Bad Order");
    console.log(badOrder);

    io.socket.request($scope.socketOptions('post','/bad_orders/add',{},badOrder), function (body, JWR) {
      console.log('Sails responded with post bad order: ', body);
      console.log('and with status code: ', JWR.statusCode);
      if(JWR.statusCode === 201){
        $scope.showAddBadOrderForm(false);
        $scope.$digest();
      }
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
        $scope.$digest();
    }

  });


}]);




// http://localhost:1337/bad_order_details?where={%22bad_order_id%22%20:%201}


// 'use strict';

// angular.module('fmApp')
// .controller('AccountsCtrl',['$scope','$sailsSocket','_', function($scope, $sailsSocket, _){
//   $scope.types = ['admin','encoder','checker','cashier'];
//   $scope.users = [];

//   $scope.user = {};
//   $scope.userEdit = {};
//   $scope.userDelete = {};
//   $scope.copiedUser = {};

//   $scope.addUserForm = false;
//   $scope.editOrDeleteUserForm = false;
//   $scope.editUserTab = true;

//   var getUsers = function () {
//     io.socket.request($scope.socketOptions('get','/users'), function (body, JWR) {
//       console.log('Sails responded with get user: ', body);
//       console.log('and with status code: ', JWR.statusCode);
//       if(JWR.statusCode === 200){
//         $scope.users = body;
//         $scope.$digest();
//       }
//     });
//   };

//   getUsers();

//   $scope.showAddUserForm = function (data) {
//       $scope.addUserForm = data;
//       if($scope.editOrDeleteUserForm === true) {
//         $scope.showEditOrDeleteUserForm(false);
//       }
//       if(data === false){
//         clearForm();
//       }
//   };

//   $scope.showEditOrDeleteUserForm = function (data) {
//       $scope.editOrDeleteUserForm = data;
//   };

//   $scope.setEditUserTab = function (data) {
//       $scope.editUserTab = data;
//       if(data === true){
//         $scope.userEdit.username = $scope.copiedUser.username;
//         $scope.userEdit.password = $scope.copiedUser.password;
//         $scope.userEdit.firstname = $scope.copiedUser.firstname;
//         $scope.userEdit.lastname = $scope.copiedUser.lastname;
//         $scope.userEdit.type = $scope.copiedUser.type;
//       } 
//   };
    
//     $scope.userClicked = function (user) {
//       if($scope.addUserForm === true){
//         $scope.showAddUserForm(false);
//       }
//       $scope.copiedUser = angular.copy(user);
//       $scope.userEdit.id = $scope.copiedUser.id;
//       $scope.userEdit.username = $scope.copiedUser.username;
//       $scope.userEdit.password = $scope.copiedUser.password;
//       $scope.userEdit.firstname = $scope.copiedUser.firstname;
//       $scope.userEdit.lastname = $scope.copiedUser.lastname;
//       $scope.userEdit.type = $scope.copiedUser.type;
      
//       $scope.userDelete.id = $scope.copiedUser.id;
//       $scope.userDelete.username = $scope.copiedUser.username;
//       $scope.userDelete.password = $scope.copiedUser.password;
//       $scope.userDelete.firstname = $scope.copiedUser.firstname;
//       $scope.userDelete.lastname = $scope.copiedUser.lastname;
//       $scope.userDelete.type = $scope.copiedUser.type;

//       $scope.showEditOrDeleteUserForm(true);
//     };

//     var clearForm = function () {
//       $scope.user.username = '';
//       $scope.user.firstname = '';
//       $scope.user.lastname = '';
//       $scope.user.password = '';
//       $scope.user.type= $scope.types[0];
//     }; 

//   $scope.addUser = function (user) {
//     io.socket.request($scope.socketOptions('post','/users',{},user), function (body, JWR) {
//       console.log('Sails responded with post user: ', body);
//       console.log('and with status code: ', JWR.statusCode);
//       if(JWR.statusCode === 201){
      
//       }
//     });   
//   }; 

//   $scope.editUser = function (newInfo) {
//       console.log(newInfo);
//       $sailsSocket.put('/users/' + newInfo.id, newInfo).success(function (data) {
//         var index = _.findIndex($scope.users, function(user) { return user.id == data.id; });
//         $scope.users[index] = data;
//         $scope.showEditOrDeleteUserForm(false);
//       }).error(function (err) {
//         console.log(err);
//       });
//   };

//   $scope.deleteUser = function (user) {
//     io.socket.request($scope.socketOptions('delete','/users/' + user.id,{}), function (body, JWR) {
//       console.log('Sails responded with delete user: ', body);
//       console.log('and with status code: ', JWR.statusCode);
//       if(JWR.statusCode === 200){
        
//       }
//     }); 
//   };

//   io.socket.on('users', function(msg){
//     console.log("Message Verb: " + msg.verb);
//     console.log("Message Data :");
//     console.log(msg.data);

//     switch (msg.verb) {
//       case "created": 
//         console.log("User Created");
//         $scope.users.push(msg.data);
//         $scope.showAddUserForm(false);
//         clearForm()
//         $scope.$digest();
//         break;
//       case "destroyed":
//         console.log("User Deleted");
//         console.log($scope.users);
//         var index = _.findIndex($scope.users,{'id': msg.data.id});
//         $scope.users.splice(index,1);
//         $scope.showEditOrDeleteUserForm(false);
//         $scope.$digest();
//     }

//   });


// }]);
