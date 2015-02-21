/**
* Returns.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	return_date : {
  		type : 'string',
  		required : true
  	}
  },

  afterCreate : function(returns, next){
    Returns.publishCreate(returns);
    next();
  },

  afterUpdate : function(returns, next){
    Returns.publishUpdate(returns.id, returns);
    next();
  },

  afterDestroy : function(returns, next){
    sails.sockets.blast('returns', {verb : 'destroyed', data : returns[0].id});
    next();
  }
};

