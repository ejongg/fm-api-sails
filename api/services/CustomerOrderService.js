
var Promise = require('bluebird');
var moment = require('moment');

module.exports = {
	createOrder : function (amount, customerId, supplierAgent, user, orders){
		return new Promise(function (resolve){
			var order = {
				total_amount : amount,
				customer_id : customerId,
				supplieragent_name : supplierAgent,
				user  : user,
				date_received : moment().format('YYYY-MM-DD')
			};

			Customer_orders.create(order)
				.then(function (createdOrder){

					new Promise(function (resolve){
						resolve(orders);
					})

					.then(function (products){
						return CustomerOrderService.assignProdDate(products);
					})

					.each(function (product){
						return CustomerOrderService.createOrderProducts(product, createdOrder.id);
					})

					.then(function (){
						resolve(createdOrder);
					})
				})
		});	
	},

	createOrderProducts : function (product, orderId){
		return new Promise(function (resolve){

			var orderProduct = {
				order_id : orderId,
				sku_id : product.sku_id,
				cases : product.cases,
				prod_date : product.prod_date
			};

			Customer_order_products.create(orderProduct)
				.then(function (){
					return SkuService.getCompanyName(product.sku_id);
				})

				.then(function (company){
					if(company == "SMB"){
						return InventoryService.deduct(product.sku_id, product.bottles, product.cases, product.bottlespercase);
					}
				})

				.then(function (){
					resolve();
				})
		});
	},

	getOrderProducts : function(order){
		return new Promise(function (resolve){
			Customer_order_products.find({order_id : order.id}).populate('sku_id')
				.then(function (products){
					order.productslist = products;
					resolve(order);	
				});	

		});
	},

	getTotalAmount : function (products){
		return new Promise(function (resolve){
			var totalAmount = 0;

			new Promise(function (resolve){
				resolve(products);
			})

			.each(function (product){
				totalAmount = totalAmount + (product.sku_id.pricepercase * product.cases);
			})

			.then(function (){
				resolve(totalAmount);
			})

		});
	},

	assignProdDate : function (products){
		var finalProducts = [];
		return new Promise(function (resolve){
			
			new Promise(function (resolve){
				resolve(products);
			})

			.each(function (product){
				return new Promise(function (resolve){
					if(product.company == "SMB"){
						Inventory.find({sku_id : product.sku_id, bay_id : product.bay_id}).sort('exp_date ASC')
							.then(function (items){
								var index = 0;
								var remainingCases = product.cases;

								do{
									if(remainingCases <= items[index].physical_count){
										var prod = _.clone(product);
										prod.cases = remainingCases;
										prod.prod_date = items[index].prod_date;
										finalProducts.push(prod);
										remainingCases = 0;
										resolve();
									}else{
										var prod = _.clone(product);
										prod.cases = items[index].physical_count;
										prod.prod_date = items[index].prod_date;
										finalProducts.push(prod);
										remainingCases = remainingCases - items[index].physical_count;
										index++;
									}

								}while(remainingCases > 0);
							})
					}else{
						finalProducts.push(product);
						resolve(finalProducts);
					}
					
				});
				
			})

			.then(function (){
				resolve(finalProducts);
			})

		});
	}
};