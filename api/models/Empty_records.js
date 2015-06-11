/**
* Empty_records.js
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
  	    columnName: 'er_id'
  	  },
	  sku_id : {
  	    model : 'sku',
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
  	  date : {
  	  	type : 'string',
  	  	required : true
  	  },
  	  purchase_id : {
  	  	model : 'purchases'
  	  }
  }
};

