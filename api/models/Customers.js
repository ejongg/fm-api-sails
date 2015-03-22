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
  		required : true,
      enum : [1, 2, 3, 4, 5]
  	},
  	orders : {
  		collection : 'customer_orders',
  		via : 'customer_id'
  	}
  },

  afterUpdate : function(customer, next){
    sails.sockets.blast('customers', {verb : 'updated', data : customer});
  },

  afterDestroy : function(customer, next){
    sails.sockets.blast('customers', {verb : 'destroyed', data : customer});
  }
};

