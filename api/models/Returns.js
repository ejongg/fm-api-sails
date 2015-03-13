/**
* Returns.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    id: {
      type: 'integer',
      unique: true,
      primaryKey: true,
      autoIncrement : true,
      columnName: 'return_id'
    },
  	return_date : {
  		type : 'string',
  		required : true
  	}
  },

  afterUpdate : function(returns, next){
    Returns.publishUpdate(returns.id, returns);
  },

  afterDestroy : function(returns, next){
    sails.sockets.blast('returns', {verb : 'destroyed', data : returns});
  }
};

