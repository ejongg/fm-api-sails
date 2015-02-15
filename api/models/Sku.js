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
    sku_name : {
      type : 'string',
      required, true
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
  },

  afterCreate : function(sku, next){
    Product_details.publishCreate(sku);
  },

  afterUpdate : function(sku, next){
    Product_details.publishUpdate(sku.id, sku);
  },

  afterDestroy : function(sku, next){
    sails.sockets.blast('sku', {verb : 'destroyed', data : sku[0].id});
  }
};

