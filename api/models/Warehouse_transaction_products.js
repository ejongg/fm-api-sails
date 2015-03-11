/**
* Warehouse_products.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	wtrans_id : {
  		model : 'warehouse_transactions',
  		required : true
  	},
  	sku_id : {
  		model : 'sku',
  		required : true
  	},
  	bottles : {
  		type : 'integer',
      defaultsTo : 0
  	},
  	cases : {
  		type : 'integer',
      defaultsTo : 0
  	}
  },

  afterUpdate : function(warehouse_product, next){
    Warehouse_products.publishUpdate(warehouse_product.id, warehouse_product);
  },

  afterDestroy : function(warehouse_product, next){
    sails.sockets.blast('warehouse_products', {verb : 'destroyed', data : warehouse_product[0].id});
  }
};

