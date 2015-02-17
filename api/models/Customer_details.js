/**
* Customer_details.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	establishment_name : {
  		type : 'string',
  		required : true
  	},
  	address : {
  		type : 'string',
  		required : true
  	},
  	owner_name : {
  		type : 'string',
  		required : true
  	},
    type : {
      type : 'string',
      required : true
    },
    distance_rating : {
      type : 'integer',
      required : true
    },
    transactions : {
      collection : 'delivery_transactions',
      via : 'customer_id'
    },
    orders : {
      collection : 'customer_orders',
      via : 'cust_id'
    }
  },

  afterCreate : function(customer, next){
    Customer_details.publishCreate(customer);
  },

  afterUpdate : function(customer, next){
    Customer_details.publishUpdate(customer.id, customer);
  },

  afterDestroy : function(customer, next){
    sails.sockets.blast('customer_details', {verb : 'destroyed', data : customer[0].id});
  }
};

