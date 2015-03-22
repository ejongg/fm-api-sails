/**
* Incomplete_cases.js
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
  		columnName: 'inc_id'
  	},
  	sku_id : {
  		model : 'sku',
  		required : true
  	},
  	exp_date : {
  		type : 'string',
  		required : true
  	},
  	bottles : {
  		type : 'integer',
  		required : true,
      defaultsTo : 0
  	}
  }
};

