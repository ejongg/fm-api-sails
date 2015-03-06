/**
* Purchase_products.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    purchase_id : {
      model : 'purchases',
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

  afterCreate : function(purchase_products, next){
    sails.sockets.blast('purchase_products', {verb : 'created', data : purchase_products});
  },

  afterUpdate : function(purchase_products, next){
    sails.sockets.blast('purchase_products', {verb : 'updated', data : purchase_products});
  },

  afterDestroy : function(purchase_products, next){
    sails.sockets.blast('purchase_products', {verb : 'destroyed', data : purchase_products[0].id});
  }
};

