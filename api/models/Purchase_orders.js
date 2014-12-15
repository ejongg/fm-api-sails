/**
* Purchase_orders.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	product : {
  		required : true,
  		model : 'products'
  	},
  	total_amount : {
  		required : true,
  		type : 'decimal'
  	},
  	date_ordered : {
  		required : true,
  		type : 'date'
  	},
  	date_arrived : {
  		required : true,
  		type : 'date'
  	}
  }
};

