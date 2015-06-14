
var moment = require('moment');
var Promise = require("bluebird");

module.exports = {
	createDeliveryProducts : function (product, deliveryId){
		return new Promise(function (resolve){
			var orderProduct = {
				dtrans_id : deliveryId,
				sku_id : product.sku_id,
				cases : product.cases,
				prod_date : product.prod_date
			};

			Delivery_products.create(orderProduct)
				.then(function (){
					resolve();
				})
		});
	},

	createDelivery : function (order, loadoutId, loadoutNumber, truckId, deliveryDate, user){
		return new Promise(function (resolve){
			var delivery = {
				total_amount : order.total_amount,				
				customer_id : order.customer_id.id,
				order_id : order.id,
				loadout_id : loadoutId,
				delivery_date : deliveryDate,
				truck_id : truckId,
				user : user	
			};

			Delivery_transactions.create(delivery)
				.then(function (createdDelivery){
					return createdDelivery;
				})

				.then(function (createdDelivery){
					return new Promise(function (resolve){
						new Promise(function (resolve){
							resolve(order.productslist);
						})

						.each(function (product){
							return DeliveryService.createDeliveryProducts(product, createdDelivery.id);
						})
						
						.then(function (){
							resolve(createdDelivery);
						})
					});
				})

				.then(function (createdDelivery){
					return Customer_orders.update({id : order.id}, {delivery_id : createdDelivery.id});
				})

				.then(function (){
					resolve();
				})
		});
	},

	completeDeliveries : function (loadoutId){
		return new Promise(function (resolve){

			Delivery_transactions.find({loadout_id : loadoutId})	
				.then(function (deliveries){
					return deliveries;
				})

				.each(function (delivery){
					return Delivery_transactions.update({id : delivery.id}, {status : "Complete"});						
				})

				.then(function (){
					resolve();
				})
		});
	},

	assignEmpties : function (deliveryId, returnId){
		return new Promise(function (resolve){

			Delivery_transactions.findOne({id : deliveryId})
				.then(function (foundDelivery){
					foundDelivery.returns_id = returnId;

					foundDelivery.save(function (err, saved){
						resolve(saved);
					});
				})
		});
	}
};