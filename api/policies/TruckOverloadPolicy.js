var Promise = require('bluebird');

module.exports = function(req, res, next){
	var orders = req.body.orders;	
	var truckId = req.body.truck_id;

	if(!Array.isArray(orders)){
		orders = [orders];
	}

	Trucks.findOne({id : truckId}).then(function (foundTruck){
		var accumulatedWeight = 0;

		new Promise(function (resolve){
			resolve(orders);
		})

		.each(function (order){
			return new Promise(function (resolve){
				TrucksService.countOrderWeight(truckId, order.productslist)
					.then(function (resultWeight){
						accumulatedWeight = accumulatedWeight + resultWeight;
						resolve();
					})
			});
		})

		.then(function (){
			if(foundTruck.carry_weight < foundTruck.current_load_weight + accumulatedWeight){
				return res.send({message : "Can't accomodate orders, it exceeds the truck capacity"}, 400);
			}else{
				next();
			}
		})
	});
};