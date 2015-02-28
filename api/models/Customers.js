/**
* Customers.js
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
      columnName: 'customer_id'
    },
  	establishment_name : {
  		type : 'string',
  		required : true,
      unique : true
  	},
  	owner_name : {
  		type : 'string',
  		required : true
  	},
  	address : {
  		type : 'string',
  		required : true
  	},
  	distance_rating : {
  		type : 'integer',
  		required : true
  	},
  	orders : {
  		collection : 'customer_orders',
  		via : 'customer_id'
  	}
  },

  afterCreate : function(customer, next){
    Customers.publishCreate(customer);
    next();
  },

  afterUpdate : function(customer, next){
    Customers.publishUpdate(customer.id, customer);
    next();
  },

  afterDestroy : function(customer, next){
    sails.sockets.blast('customers', {verb : 'destroyed', data : customer[0].id});
    next();
  }
};

