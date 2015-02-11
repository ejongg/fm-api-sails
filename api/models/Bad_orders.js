/**
* Bad_orders.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	expense : {
  		type : "float",
  		required : true
  	},
  	date : {
  		type : "date",
  		required : true
  	},
  	status : {
  		type : "string",
  		required : true
  	},
    products : {
      collection : 'bad_order_details',
      via : 'bad_order_id'
    }
  },

  afterCreate : function(bad_order, next){
    Bad_orders.publishCreate(bad_order);
  },

  afterUpdate : function(bad_order, next){
    Bad_orders.publishUpdate(bad_order.id, bad_order);
  }
};

