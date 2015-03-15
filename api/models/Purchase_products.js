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
  	},
    costpercase : {
      type : 'integer',
      defaultsTo : 0
    },
    discountpercase : {
      type : 'float',
      defaultsTo : 0
    },
    amount : {
      type : 'float',
      required : true
    }
  },

  afterDestroy : function(purchase_products, next){
    sails.sockets.blast('purchase_products', {verb : 'destroyed', data : purchase_products});
  }
};

