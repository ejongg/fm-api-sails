/**
* Delivery_transactions.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
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
  		model : 'customer_details',
      required : true
  	},
  	return_id : {
      
  	},
  	truck_id : {
      model : 'trucks',
      required : true
  	},
    products : {
      collection : 'delivery_prods',
      via : 'dtrans_id'
    }
  },

  afterCreate : function(delivery, next){
    Delivery_transactions.publishCreate(delivery);
  },

  afterUpdate : function(bay, next){
    Delivery_transactions.publishUpdate(delivery.id, delivery);
  }
};

