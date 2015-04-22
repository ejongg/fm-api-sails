/**
 * Delivery_transactionsController
 *
 * @description :: Server-side logic for managing delivery_transactions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	remove : function (req, res){
		var delivery = req.body.delivery;
		var loadout = req.body.loadout;

		Delivery_transactions.findOne({id : delivery})
			.then(function (foundDelivery){
				return foundDelivery;
			})

			.then(function (foundDelivery){
				return DeliveryService.removeLoadout(foundDelivery);
			})

			.then(function (updatedDelivery){
				var obj = {
					delivery : updatedDelivery,
					loadout : loadout
				};

				sails.sockets.blast("loadout", {verb : "removed", data : obj});
				return res.send("Delivery removed from " + loadout,200);
			})

			.catch(function (err){
				return res.send(err);
			});
	},

	getTransactionDetails : function(req, res){
		var transactionId = req.query.id;
		var transactionList = [];

		Delivery_products.find({dtrans_id : transactionId}).populate("sku_id")
			.then(function (products){
				return products;
			})

			.each(function (product){
				return SkuService.getCompany(product.sku_id.id)
					.then(function (company){
						product.sku_id.company = company;
						transactionList.push(product);
					})
			})

			.then(function (){
				return res.send(transactionList);
			})
	}
};

