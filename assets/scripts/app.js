'use strict';

angular.module('fmApp', ['ui.router','angular-jwt','angularUtils.directives.dirPagination','angular.snackbar','ui.bootstrap', 'ui.bootstrap.typeahead','chart.js'] )

.constant('httpHost','http://localhost:1337')
.constant('_', window._)
.constant('accessLevels', {
  'visitor': 0,
  'admin': 1,
  'encoder': 2,
  'cashier': 3,
  'checker': 4
})
.config(['$urlRouterProvider', '$stateProvider','accessLevels', function ($urlRouterProvider, $stateProvider, accessLevels) {
  console.log("Config");
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('login', {
      url:'/',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl',
      data: {
        access: accessLevels.visitor
      }
    })

    .state('admin', {
      url:'/admin',
      abstract: true,
      templateUrl: 'templates/main.html',
      controller: 'MainCtrl',
      data: {
        access: accessLevels.admin
      }
    })
      .state('admin.accounts', {
        url:'/personnel/accounts',
        views: {
          'mainContent': {
            templateUrl: 'templates/accounts.html',
            controller: 'AccountsCtrl'
          }
        }  
      })
      .state('admin.dssr', {
        url:'/dssr',
        views: {
          'mainContent': {
            templateUrl: 'templates/dssr.html',
            controller: 'DSSRCtrl'
          }
        }  
      })
      .state('admin.products', {
        url:'/inventory/products',
        views: {
          'mainContent': {
            templateUrl: 'templates/products.html',
            controller:'ProductsCtrl'
          }
        }  
      })
      .state('admin.bays', {
        url:'/inventory/bays',
        views: {
          'mainContent': {
            templateUrl: 'templates/bays.html',
            controller:'BaysCtrl'
          }
        }  
      })
      .state('admin.trucks', {
        url:'/delivery/trucks',
        views: {
          'mainContent': {
            templateUrl: 'templates/trucks.html',
            controller:'TrucksCtrl'
          }
        }  
      })
      .state('admin.employees', {
        url:'/personnel/employees',
        views: {
          'mainContent': {
            templateUrl: 'templates/employees.html',
            controller:'EmployeesCtrl'
          }
        }  
      })
      .state('admin.routes', {
        url:'/delivery/routes',
        views: {
          'mainContent': {
            templateUrl: 'templates/routes.html',
            controller:'RoutesCtrl'
          }
        }  
      })
      .state('admin.edit-account', {
        url:'/edit-account',
        views: {
          'mainContent': {
            templateUrl: 'templates/edit-account.html',
            controller:'AccountsEditCtrl'
          }
        }  
      })

    .state('encoder', {
      url:'/encoder',
      abstract: true,
      templateUrl: 'templates/main.html',
      controller: 'MainCtrl',
      data: {
        access: accessLevels.encoder
      }
    })
      .state('encoder.sku', {
        url:'/inventory/sku',
        views: {
          'mainContent': {
            templateUrl: 'templates/sku.html',
            controller:'SKUCtrl'
          }
        }  
      })
      .state('encoder.purchases', {
        url:'/inventory/purchases',
        views: {
          'mainContent': {
            templateUrl: 'templates/purchases.html',
            controller:'PurchasesCtrl'
          }
        }  
      })
      .state('encoder.orders', {
        url:'/orders',
        views: {
          'mainContent': {
            templateUrl: 'templates/orders.html',
            controller:'OrdersCtrl'
          }
        }  
      })
      .state('encoder.bad-order', {
        url:'/bad-order',
        views: {
          'mainContent': {
            templateUrl: 'templates/bad-order.html',
            controller:'BadOrdersCtrl'
          }
        }  
      })
      .state('encoder.accounts', {
        url:'/accounts',
        views: {
          'mainContent': {
            templateUrl: 'templates/accounts.html',
            controller: 'AccountsCtrl'
          }
        }  
      })
      .state('encoder.customers', {
        url:'/delivery/customers',
        views: {
          'mainContent': {
            templateUrl: 'templates/customers.html',
            controller:'CustomersCtrl'
          }
        }  
      })
      .state('encoder.load-outs', {
        url:'/delivery/load-outs',
        views: {
          'mainContent': {
            templateUrl: 'templates/load-outs.html',
            controller:'LoadOutsCtrl'
          }
        }  
      })
      .state('encoder.inventory', {
        url:'/inventory',
        views: {
          'mainContent': {
            templateUrl: 'templates/inventory.html',
            controller:'InventoryCtrl'
          }
        }  
      })
      .state('encoder.payments', {
        url:'/sales/payments',
        views: {
          'mainContent': {
            templateUrl: 'templates/payments.html',
            controller:'PaymentsCtrl'
          }
        }  
      })
       .state('encoder.transaction-history', {
        url:'/reports/transaction-history',
        views: {
          'mainContent': {
            templateUrl: 'templates/transaction-history.html',
            controller:'TransactionHistoryCtrl'
          }
        }  
      })
       .state('encoder.incomplete', {
        url:'/inventory/incomplete-cases',
        views: {
          'mainContent': {
            templateUrl: 'templates/incomplete.html',
            controller:'IncompleteCtrl'
          }
        }  
      })
       .state('encoder.expenses', {
        url:'/reports/expenses',
        views: {
          'mainContent': {
            templateUrl: 'templates/expenses.html',
             controller:'ExpensesCtrl'
          }
        }  
      })
    .state('cashier', {
      url:'/cashier',
      abstract: true,
      templateUrl: 'templates/main.html',
      controller: 'MainCtrl',
      data: {
        access: accessLevels.cashier
      }
    })
      .state('cashier.pos', {
        url:'/pos',
        views: {
          'mainContent': {
            templateUrl: 'templates/pos.html',
            controller:'POSCtrl'
          }
        }  
      })
      .state('cashier.accounts', {
        url:'/accounts',
        views: {
          'mainContent': {
            templateUrl: 'templates/accounts.html',
            controller: 'AccountsCtrl'
          }
        }  
      })


    .state('checker', {
      url:'/checker',
      abstract: true,
      templateUrl: 'templates/main.html',
      controller: 'MainCtrl',
      data: {
        access: accessLevels.checker
      }
    })
      .state('checker.tally', {
        url:'/tally',
        views: {
          'mainContent': {
            templateUrl: 'templates/tally.html'
          }
        }  
      })

}])	

.run(['$rootScope','$state','userService','authService', function ($rootScope, $state, userService,authService) {
  console.log("Run");
  if (authService.getToken()) {
     userService.getUser();
  }
}])

// function isEmpty(value) {
//   return angular.isUndefined(value) || value === '' || value === null || value !== value;
// }

// var isEmpty = function (value) {
//   return angular.isUndefined(value) || value === '' || value === null || value !== value;
// }

.directive('ngMax', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {
          console.log(attr.ngMax);
            scope.$watch(attr.ngMax, function(){
                ctrl.$setViewValue(ctrl.$viewValue);
            });
            var maxValidator = function(value) {
              var max = scope.$eval(attr.ngMax) || Infinity;
              if (!isEmpty(value) && value > max) {
                ctrl.$setValidity('ngMax', false);
                return undefined;
              } else {
                ctrl.$setValidity('ngMax', true);
                return value;
              }
            };

            ctrl.$parsers.push(maxValidator);
            ctrl.$formatters.push(maxValidator);
        }
    };
})

.controller('MainCtrl',['$scope', 'authService', '$state', 'userService','$filter','$rootScope','snackbar', 
  function($scope,authService,$state,userService,$filter,$rootScope,snackbar){

  $scope.dateToday = new Date();
  $scope.userType =  userService.getUserType();
  $scope.userFirstName = userService.getFirstName();
  $scope.userLastName = userService.getLastName();
  $scope.userName = $scope.userFirstName + " " + $scope.userLastName;
  console.log($scope.userName);

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
     console.log("state change");
     console.log(userService.getAccessLevel());
     console.log(toState.data.access);
    
      if (!(userService.getAccessLevel() === toState.data.access) ) {
        if(userService.getAccessLevel() !== 1){
          event.preventDefault();

          switch (userService.getAccessLevel()) {
            case 1:
              $state.go('admin.dssr');
              break;
            case 2:
              $state.go('encoder.sku');
              break;
            case 3:
              $state.go('cashier.pos');
              break;
            case 4:
              $state.go('checker.tally');
              break;
            default:
              userService.removeAccessLevel();
              $state.go('login');
          }
        }

      }
    });

  $rootScope.$on("firstName",function(){
    console.log("Firstname");
     $scope.userFirstName = userService.getFirstName();
     console.log($scope.userFirstName);
     $scope.$digest();
  });
  
  $rootScope.$on("lastName",function(){
    console.log("lastname");
     $scope.userLastName = userService.getLastName();
     console.log($scope.userLastName);
     $scope.$digest();
  });

  $scope.snackbarShow = function (msg) {
    console.log("Snackbar");
    console.log(msg);
    snackbar.create(msg, 3000);
  };

  $scope.checkError = function (err) {
    if(err.error === 'Unauthorized'){
        $scope.logout();
      }
  };

  $scope.logout = function () {
    console.log("LogOut");
    authService.logout();
    userService.removeAccessLevel();
    $state.go('login');
  };

  $scope.socketOptions = function (method,url,headers,params) {
    return {
      method: method,
      url: url,
      headers: headers,
      params: params
    };
  };

  $scope.formatDate = function (passedDate) {
    return $filter('date')(passedDate,'yyyy-MM-dd');
  };

  $scope.sortData = function(data,predicate){
    console.log("Data Sort");
    return $filter('orderBy')(data,predicate);
  };

}]);

var isEmpty = function (value) {
  return angular.isUndefined(value) || value === '' || value === null || value !== value;
}

