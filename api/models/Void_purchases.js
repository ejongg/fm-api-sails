/**
* Void_purchases.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	id: {
  	  type: 'integer',
  	  unique: true,
  	  primaryKey: true,
  	  autoIncrement : true,
  	  columnName: 'vp_id'
  	},
  	purchase_id : {
  	  model : 'purchases',
  	  required : true,
  	  unique : true
  	},
  	date : {
  	  type : 'string',
  	  required : true
  	},
  	user : {
  	  type : 'string',
  	  required : true
  	}
  },

  afterCreate : function(voidPurchase, next){
  	Void_purchases.findOne({id : voidPurchase.id}).populate('purchase_id')
  		.then(function (foundVoidPurchase){
  			sails.sockets.blast('purchase', {verb : 'void', data : foundVoidPurchase});
  			next();
  		})
  }
};

