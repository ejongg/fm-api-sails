/**
* Expense_products.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	id : {
  	  type: 'integer',
  	  unique: true,
  	  primaryKey: true,
  	  autoIncrement : true,
  	  columnName: 'expense_prod_id'
  	},
	sku_id : {
      model : 'sku',
      required : true
	},
	bottles : {
	  type : 'integer'
	},
	cases : {
	  type : 'integer',
	  required : true
	},
	expense_id : {
	  model : 'expenses',
	  required : true
	}
  }
};

