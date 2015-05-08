/**
* Expenses.js
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
  	  columnName: 'expense_id'
  	},
  	type : {
	  type : 'string',
	  required : true
  	},
  	amount : {
	  type : 'integer',
	  required : true
  	},
  	date : {
	  type : 'string',
	  required : true
  	},
  	user : {
	  type : 'string',
	  required : true
  	}
  }
};
