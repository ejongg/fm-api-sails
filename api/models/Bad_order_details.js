/**
* Bad_order_details.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	bad_order_id : {
  		model : 'bad_orders',
  		required : true
  	},
  	sku_id : {
  		model : 'sku',
  		required : true
  	},
  	cases : {
  		type : 'integer',
  		required : true
  	},
  	reason : {
  		type : 'string',
  		required : true
  	}
  },

  afterCreate : function(bad_order_detail, next){
    Bad_order_details.publishCreate(bad_order_detail);
    next();
  },

  afterUpdate : function(bad_order_detail, next){
    Bad_order_details.publishUpdate(bad_order_detail.id, bad_order_detail);
    next();
  },

  afterDestroy : function(bad_order_detail, next){
    sails.sockets.blast('bad_order_details', {verb : 'destroyed', data : bad_order_detail[0].id});
    next();
  }
};

