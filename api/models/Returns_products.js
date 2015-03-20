/**
* Return_details.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	return_id : {
  		model : 'returns',
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
  	},
  	deposit : {
  		type : 'float',
  		required : true
  	}
  },

  afterDestroy : function(returns_products, next){
    sails.sockets.blast('returns_products', {verb : 'destroyed', data : returns_products});
    next();
  }
};

