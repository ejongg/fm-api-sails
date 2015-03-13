/**
* Customer_order_products.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	order_id : {
  		model : 'customer_orders',
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

  afterUpdate : function(order_product, next){
    Customer_order_products.publishUpdate(order_product.id, order_product);
  },

  afterDestroy : function(order_product, next){
    sails.sockets.blast('order_products', {verb : 'destroyed', data : order_product});
  }
};

