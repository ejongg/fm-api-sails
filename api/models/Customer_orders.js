/**
* Customer_orders.js
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
      columnName: 'customer_order_id'
    },
  	customer_id : {
  		model : 'customers',
  		required : true
  	},
  	supplieragent_name : {
  		type : 'string',
  		required : true,
      defaultsTo : 'N/A'
  	},
  	date_received : {
  		type : 'string',
  		required : true
  	},
  	status : {
  		type : 'string',
  		required : true,
      defaultsTo : 'Pending',
      enum : ['Pending', 'Delivered', 'To be delivered']
  	},
  	user : {
  		type : 'string',
  		required : true
  	},
    total_amount : {
      type : 'integer',
      required : true,
      defaultsTo : 0
    },
    delivery_id : {
      model : "delivery_transactions"
    },
    products : {
      collection : 'customer_order_products',
      via : 'order_id'
    }
  },

  afterUpdate : function(customer_order, next){
    sails.sockets.blast('customer_orders', {verb : 'updated', data : customer_order});
    next();
  },

  afterDestroy : function(customer_order, next){
    sails.sockets.blast('customer_orders', {verb : 'destroyed', data : customer_order});
    next();
  }
};

