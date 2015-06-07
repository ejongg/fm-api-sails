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
  		required : true,
      defaultsTo : 0
  	},
    costpercase : {
      type : 'float',
      defaultsTo : 0.00
    },
    discountpercase : {
      type : 'float',
      defaultsTo : 0.00
    },
    amount : {
      type : 'float',
      required : true,
      defaultsTo : 0.00
    },
    prod_date : {
      type : 'string',
      required : true
    },
    bay_id : {
      model : 'bays',
      required : true
    }
  },

  afterDestroy : function(purchase_products, next){
    sails.sockets.blast('purchase_products', {verb : 'destroyed', data : purchase_products});
    next();
  }
};

