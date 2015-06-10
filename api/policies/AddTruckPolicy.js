var Promise = require('bluebird');

module.exports = function (req, res, next){
	var findTruck = {
	    driver : req.body.driver.id,
		dispatcher : req.body.dispatcher.id,
		agent : req.body.agent.id,
		helper : req.body.helper.id
	};

	Trucks.findOne(findTruck)
		.then(function(foundTruck){

			if(foundTruck){
				return res.send({message : "You are entering a duplicate entry"}, 400);
			}else{
				next();
			}
		})
};