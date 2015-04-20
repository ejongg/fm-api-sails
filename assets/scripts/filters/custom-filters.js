'use strict';

angular.module("fmApp")
.filter("range", function ($filter) {
    return function (data, page, size) {
        if (angular.isArray(data) && angular.isNumber(page) && angular.isNumber(size)) {
            var start_index = (page - 1) * size;
            if (data.length < start_index) {
                return [];
            } else {
                var results = $filter("limitTo")(data.slice(start_index), size);
                console.log("Filter: "+ results);
                return results;
            }
        } else {
            return data;
        }
    }
})
.filter("companyFilter", function ($filter) {
    return function (data,company) {
        if (angular.isArray(data)) {
            var result = [];
            result = $filter('filter')(data,company);
            console.log(result);
            return result;
        } else {
            return data;
        }
    }
})
.filter("transactionFilter", function ($filter) {
    return function (data) {
        if (angular.isArray(data)) {
            console.log(data);
            var result = [];
            angular.forEach(data, function(value , key){
              if(value.type = 'Delivery'){
                console.log("Delivery");
              }else {
                console.log("Warehouse sales");
              }
            });
            // result = $filter('filter')(data,searchText);
            // console.log(result);
            // return result;
        } else {
            return data;
        }
    }
})
.filter("searchFilter", function ($filter) {
    return function (data,searchText) {
        if (angular.isArray(data)) {
            var result = [];
            result = $filter('filter')(data,searchText);
            console.log(result);
            return result;
        } else {
            return data;
        }
    }
});
