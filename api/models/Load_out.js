/**
* Load_out.js
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
  		columnName: "loadout_id"
  	},
  	date_created : {
  		type : "string",
  		required : true
  	},
  	status : {
  		type : "string",
  		defaultsTo : "Not verified"
  	},
  	loadout_number : {
  		type : "integer",
  		required : true
  	}
  }
};

