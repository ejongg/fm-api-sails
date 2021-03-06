/**
* Inventory.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	bay_id : {
      model : 'bays',
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
  	exp_date : {
  		type : 'date',
  		required : true
  	},
  	age : {
  		type : 'integer',
  		required : true
  	}
  }
};

