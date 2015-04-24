/**
* Ending_inventory.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  connection : 'localDiskDb',
  
  attributes: {

  	month : {
  		type : "string",
  		required : true
  	},

  	day : {
  		type : "string",
  		required : true
  	},

  	year : {
  		type : "string",
  		required : true
  	},

  	count : {
  		type : "integer",
  		required : true
  	},

  	getFullDate : function(){
  		return this.year + "-" + this.month + "-" + day;
  	}
  }
};

