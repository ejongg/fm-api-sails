/**
* Employees.js
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
  		columnName: "emp_id"
  	},
  	emp_fname : {
  		type : "string",
  		required : true
  	},
    emp_lname : {
      type : "string",
      required : true
    },
  	position : {
  		type : "string",
  		required : true
  	},
    office : {
      type : "string",
      required : true
    },
    hire_date : {
      type : "string",
      required : true
    },
    end_contract : {
      type : "string",
      required : true
    },
    status : {
      type : "string",
      required : true
    },
    truck_id : {
      model : "trucks"
    }
  },

  afterUpdate : function(employee, next){
  	sails.sockets.blast('employees', {verb : "updated", data : employee});
    next();
  },

  afterDestroy : function(employee, next){
  	sails.sockets.blast('employees', {verb : "destroyed", data : employee});
    next();
  }
};

