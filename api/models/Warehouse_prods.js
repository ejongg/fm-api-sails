/**
* Warehouse_prods.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	wtrans_id : {
      model : 'warehouse_transactions',
      required : true
  	},
    prod_id : {
      model : 'products',
      required : true
    },
  	cases : {
  		type : 'integer',
  		required : true
  	},
  	bottles : {
  		type : 'integer',
  		required : true
  	}
  }
};

