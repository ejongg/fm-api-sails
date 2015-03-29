/**
* Trucks.js
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
      columnName: 'truck_id'
    },
  	driver : {
  		type : 'string',
  		required : true
  	},
  	dispatcher : {
  		type : 'string',
  		required : true
  	},
  	agent : {
  		type : 'string',
  		required : true
  	},
  	helper : {
  		type : 'string',
  		required : true
  	},
  	route : {
  		type : 'string',
  		required : true
  	},
    carry_weight : {
      type : 'float',
      defaultsTo : 0
    },
    current_load_weight : {
      type : 'float',
      defaultsTo : 0.00
    },
    isAvailable : function(){
      if(this.carry_weight > this.current_load_weight){
        return true;
      }else{
        return false;
      }
    }
  }

  afterUpdate : function(truck, next){
    sails.sockets.blast('trucks', {verb : 'updated', data : truck});
    next();
  },

  afterDestroy : function(truck, next){
    sails.sockets.blast('trucks', {verb : 'destroyed', data : truck});
    next();
  }
};

