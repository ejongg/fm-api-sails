/**
* Loadin_products.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	id : {
  		type: "integer",
  		unique: true,
  		primaryKey: true,
  		autoIncrement : true,
  		columnName: "loadin_product_id"
  	},
  	sku_id : {
  		model : "sku",
  		required : true
  	},
  	cases : {
  		type : "integer",
  		required : true
  	},
  	loadin_id : {
  		model : "load_in",
  		required : true
  	}
  }
};

