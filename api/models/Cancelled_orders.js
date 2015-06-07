/**
* Cancelled_orders.js
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
  	  columnName: 'co_id'
  	},
  	order_id : {
  	  model : 'customer_orders',
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

  afterCreate : function(cancelledOrder, next){
  	Cancelled_orders.findOne({id : cancelledOrder.id}).populate('order_id')
  		.then(function (foundCancelledOrder){
  			sails.sockets.blast('customer_orders', {verb : 'cancelled', data : foundCancelledOrder});
  			next();
  		})
  }
};

