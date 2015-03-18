/**
* Delivery_transactions.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    id: {
      type: 'integer',
      unique: true,
      primaryKey: true,
      autoIncrement : true,
      columnName: 'delivery_id'
    },
  	total_amount : {
  		type : 'integer',
  		required : true
  	},
  	paid_amount : {
  		type : 'integer'
  	},
  	delivery_date : {
  		type : 'string',
  		required : true
  	},
  	payment_date : {
  		type : 'string',
  	},
  	customer_id : {
  		model : 'customers',
  		required : true
  	},
  	returns_id : {
  		model : 'returns'
  	},
  	truck_id : {
  		model : 'trucks',
  		required : true
  	},
  	order_id : {
  		model : 'customer_orders',
  		required : true
  	},
  	status : {
  		type : 'string',
  		required : true,
      defaultsTo : 'To be delivered'
  	},
  	user : {
  		type : 'string',
      required : true
  	}
  },

  afterUpdate : function(delivery_transaction, next){
    Delivery_transactions.publishUpdate(delivery_transaction.id, delivery_transaction);
  },

  afterDestroy : function(delivery_transaction, next){
    sails.sockets.blast('delivery_transactions', {verb : 'destroyed', data : delivery_transaction});
  }
};

