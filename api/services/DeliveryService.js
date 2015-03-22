
var _ = require('lodash');
var async = require('async');
var moment = require('moment');

module.exports = {
	/**
	*	TODO assign the new order to a delivery
	*	TODO add cost for the customer order products
	*
	*	Question : Does FM know the routes of the 
	*	orders depending on the location of the store
	*	that ordered?
	*/
	assignOrder : function(order_id, user){
		var availableTrucks = [];
		var products = [];
		var cust_id = '';
		var total_amount = 0;
		var total_weight = 0;

		async.series([
			/**
			*	Check the products of the order then
			*	push them in the products array
			*/
			function(cb){
				Customer_orders.findOne({id : order_id}).populate('products')
					.exec(function(err, order){

						_(order.products).forEach(function(order_product){
							if(typeof order_product === 'object'){
								products.push(order_product);

								Sku.findOne({id : order_product.id})
									.exec(function(err, sku){
										total_amount = total_amount + ((sku.bottlespercase * order_product.cases) * sku.price);
										total_weight = total_weight + sku.weightpercase;
									});
							}
						}).value();

						cust_id = order.customer_id;
						cb();
					});
				},
			function(cb){
				/**
				*	Find all the available trucks.
				*/
				Trucks.find()
					.exec(function(err, trucks){
						async.each(trucks, function(truck, cb){
							if(truck.isAvailable()){
								availableTrucks.push(truck);
							}

							cb(); // cb for async.each
						});

						cb();	//cb for async.series
					});

			}
		], function(err, cb){
			if(err)
				console.log(err);

			var index = 0;
			var done = false;
			
			async.whilst(
				function(){
					return !done;
				}, 
				function(cb){
					if(availableTrucks[index].current_load_weight + total_weight < availableTrucks[index].carry_weight){
						var delivery = {
							delivery_date : moment().add(1, 'days').format('YYYY-MM-DD'),
							customer_id : cust_id,
							truck_id : availableTrucks[index].id,
							order_id : order_id,
							total_amount : total_amount,
							user : user
						};

						Delivery_transactions.create(delivery)
							.exec(function(err, created_delivery){		
								if(err)
									console.log(err);

								async.each(products, function(delivery_product, cb){
									var prod = {
										dtrans_id : created_delivery.id,
										sku_id : delivery_product.sku_id,
										cases : delivery_product.cases
									};

									Delivery_products.create(prod)
										.exec(function(err, created_delivery_product){
											Trucks.findOne({id : availableTrucks[index].id})
												.exec(function(err, truck){
													if(err)
														console.log(err);

													truck.current_load_weight = truck.current_load_weight + total_weight;
													truck.save(function(err, saved){});
												});

											cb();
										});	
								}, function(err){
									if(err)
										return console.log(err);

									done = true;
									cb(); // cb for async.whilst
								});
							});
					}else{
						index++;
						cb();
					}
				},

				function(err){
					if(err)
						console.log(err);
				}
			);
		});
	}
};