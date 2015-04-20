'use strict';

angular.module("fmApp")

.filter("transactionFilter", function ($filter) {
    return function (data) {
        
        if (angular.isArray(data)) {
            var result = [];
            angular.forEach(data, function(value , key){
              if(value.type === 'Delivery'){
                result.push({
                  "customer_name" : value.customer_id.owner_name,
                  "date" : value.delivery_date,
                  "total_amount" : value.total_amount,
                  "type" : value.type,
                  "user" : value.user     
                });
              }else {
                result.push({
                  "customer_name" : value.customer_name,
                  "date" : value.date,
                  "total_amount" : value.total_amount,
                  "type" : value.type,
                  "user" : value.user    
                });
              }
            });
            console.log(result);
            return result;
        } else {
            return data;
        }
    }
});
