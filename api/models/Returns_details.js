/**
* Returns_details.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    return_id : {
      model : 'returns',
      required : true
    },
  	prod_id : {
      model : 'products',
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
  	deposit : {
  		type : 'float',
  		required : true
  	}
  },

  afterCreate : function(returns_detail, next){
    Returns_details.publishCreate(returns_detail);
  },

  afterUpdate : function(returns_detail, next){
    Returns_details.publishUpdate(returns_detail.id, returns_detail);
  },

  afterDestroy : function(returns_detail, next){
    sails.sockets.blast('returns_details', {verb : 'destroyed', data : returns_detail[0].id});
  }
};

