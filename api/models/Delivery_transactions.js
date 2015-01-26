/**
* Delivery_transactions.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	dtrans_id : {

  	},
  	total_amount : {
  		type : 'float',
  		required : true
  	},
  	paid_amount : {
  		type : 'float',
  		required : true
  	},
  	delivery_date : {
  		type : 'date',
  		required : true
  	},
  	order_date : {
  		type : 'date',
  		required : true
  	},
  	payment_date : {
  		type : 'date',
  		required : true
  	},
  	customer_id : {
  		
  	},
  	return_id : {

  	},
  	truck_id : {

  	}
  }
};

