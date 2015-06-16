var Promise = require('bluebird');

module.exports = {
	addWeight : function (truckId, products){
		return new Promise(function (resolve){
			new Promise(function (resolve){
				resolve(products);
			})

			.each(function (product){
				return new Promise(function (resolve){
					var truck = null;

					Trucks.findOne({id : truckId}).populateAll()
						.then(function (foundTruck){
							truck = foundTruck;
							var weight = foundTruck.current_load_weight + (product.sku_id.weightpercase * product.cases);

							return Trucks.update({id : truckId}, {current_load_weight : weight});
						})

						.then(function (updatedTruck){
							sails.sockets.blast('trucks', {verb : 'updated', data : truck});
							resolve();
						})
				});
			})

			.then(function (){
				resolve();
			})
		});
	},

	removeWeight : function (truckId, products){
		return new Promise(function (resolve){
			new Promise(function (resolve){
				resolve(products);
			})

			.each(function (product){
				return new Promise(function (resolve){
					var truck = null;

					Trucks.findOne({id : truckId}).populateAll()
						.then(function (foundTruck){
							truck = foundTruck;
							var weight = foundTruck.current_load_weight - (product.sku_id.weightpercase * product.cases);

							return Trucks.update({id : truckId}, {current_load_weight : weight});
						})

						.then(function (updatedTruck){
							sails.sockets.blast('trucks', {verb : 'updated', data : truck});
							resolve();
						})
				});
			})

			.then(function (){
				resolve();
			})
		});
	},

	countOrderWeight : function (truckId, products){
		return new Promise(function (resolve){
			var weight = 0;

			new Promise(function (resolve){
				resolve(products);
			})

			.each(function (product){
				weight = weight + product.sku_id.weightpercase * product.cases;
			})

			.then(function (){
				resolve(weight);
			})
		});
	}
};