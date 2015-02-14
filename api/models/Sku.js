/**
* Product_details.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	prod_id : {
      model : 'products',
      required : true
  	},
  	bottles : {
  		type : 'integer',
  		required : true
  	},
  	cases : {
  		type : 'integer',
  		required : true
  	},
  	size : {
  		type : 'string',
  		required : true
  	},
  	price : {
  		type : 'float',
  		required : true
  	},
  	lifespan : {
  		type : 'integer',
  		required : true
  	}
  },

  afterCreate : function(sku, next){
    Product_details.publishCreate(sku);
  },

  afterUpdate : function(sku, next){
    Product_details.publishUpdate(sku.id, sku);
  },

  afterDestroy : function(product, next){
    sails.sockets.blast('product', {verb : 'destroyed', data : product[0].id});
  }
};

