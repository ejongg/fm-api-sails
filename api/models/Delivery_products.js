/**
* Delivery_products.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	dtrans_id : {
  		model : 'delivery_transactions',
  		required : true
  	},
  	sku_id : {
  		model : 'sku',
  		required : true
  	},
  	cases : {
  		type : 'integer',
  		required : true
  	}
  },

  afterUpdate : function(delivery_product, next){
    sails.sockets.blast('delivery_products', {verb : 'updated', data : delivery_product});
  },

  afterDestroy : function(delivery_product, next){
    sails.sockets.blast('delivery_products', {verb : 'destroyed', data : delivery_product});
  }
};

