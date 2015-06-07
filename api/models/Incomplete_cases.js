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
    prod_date : {
      type : 'string',
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
  },

  afterCreate : function(incomplete_case, next){
    sails.sockets.blast('incomplete_cases', {verb : 'created', data : incomplete_case});
    next();
  },

  afterUpdate : function(incomplete_case, next){
    sails.sockets.blast('incomplete_cases', {verb : 'updated', data : incomplete_case});
    next();
  },

  afterDestroy : function(incomplete_case, next){
    sails.sockets.blast('incomplete_cases', {verb : 'destroyed', data : incomplete_case});
    next();
  }
};

