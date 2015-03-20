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
  	cokeagent_name : {
  		type : 'string',
  		required : true
  	},
  	date_received : {
  		type : 'string',
  		required : true
  	},
  	status : {
  		type : 'string',
  		required : true,
      defaultsTo : 'pending',
      enum : ['pending', 'delivered']
  	},
  	user : {
  		type : 'string',
  		required : true
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

