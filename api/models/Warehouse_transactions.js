/**
* Warehouse_transactions.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	prod_id : {

  	},
  	cases : {
  		type : 'integer',
  		required : true
  	},
  	bottles : {
  		type : 'integer',
  		required : true
  	},
  	customer_name : {
  		type : 'string',
  		required : true
  	},
  	date : {
  		type : 'date',
  		required : true
  	},
  	return_id : {
  		
  	}
  }
};

