/**
* Bad_order_details.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	bad_order_id : {
      model : 'bad_orders',
      required : true
  	},
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
  	reason_for_disposal : {
  		type : 'text',
  		required : true
  	}
  }
};

