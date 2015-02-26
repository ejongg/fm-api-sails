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
        console.log("Data: "+ data);
        console.log("Company: "+ company);
        if (angular.isArray(data)) {
            var result = [];
            result = $filter('filter')(data,company);
            totalItem = result.length;
            console.log(result);
            return result;
        } else {
            return data;
        }
    }
})
.filter("searchFilter", function ($filter) {
    return function (data,searchText) {
        console.log("Data: "+ data);
        console.log("Company: "+ searchText);
        if (angular.isArray(data)) {
            var result = [];
            result = $filter('filter')(data,searchText);
            totalItem = result.length;
            console.log(result);
            return result;
        } else {
            return data;
        }
    }
});
