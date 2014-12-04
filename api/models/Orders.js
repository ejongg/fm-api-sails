/**
* Orders.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	establishment : {
  		type : 'string',
  		required : true
  	},
  	owner : {
  		type : 'string',
  		required : true
  	},
  	delivery_date : {
  		type : 'date',
  		required : true
  	},
  	order_date : {
  		type : 'date',
  		required : true
  	},
  	status : {
  		type : 'string',
  		enum : ['delivered', 'cancelled', 'pending'],
  		defaultsTo : 'pending'
  	}
  }
};

