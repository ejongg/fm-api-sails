/**
 * Customer_ordersController
 *
 * @description :: Server-side logic for managing customer_orders
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var _ = require('lodash');
var moment = require('moment');

module.exports = {
	add : function(req, res){
		var customer  = req.body.customer;
		var orders = req.body.orders;
		var cokeagent_name = req.body.cokeagent_name;
		var user = req.body.user;

		/**
		*	Find a customer if it doesn't exist create a new one
		*/
		Customers.findOrCreate({establishment_name : customer.establishment}, {
			establishment_name : customer.establishment,
			owner_name : customer.owner,
			address : customer.address,
			distance_rating : customer.distance
		}).exec(function(err, new_customer){
			if(err)
				res.json({error : 'An error has occured'});

			/**
			*	Create a new customer order for the customer
			*
			*	I did assume that the date_received should be 
			*	the date and time when the record was created.
			*	This can be subject to change depending on
			*	the suggestion of the client.
			*
			*/
			Customer_orders.create({
				customer_id : new_customer.id,
				cokeagent_name : cokeagent_name,
				date_received : moment().format('MM-DD-YYYY'),
				user  : user
			}).exec(function(err, new_cust_order){
				if(err)
					res.json({error : 'An error has occured'});

				/**
				*	Inject the order id of the products in the order
				*	and remove unneccesary attributes.
				*/

				_(orders).forEach(function(order){
					order.order_id = new_cust_order.id;
					delete order.sku;
					delete order.$$hashKey;
				}).value();

				/**
				*	Create records of the products in the order
				*	and blast to subscribed sockets that a new order
				*	is created.
				*/
				Customer_order_products.create(orders)
					.exec(function(err, new_orders){
						if(err)
							res.json({error : 'An error has occured'});

						/**
						* 	Find the newly created customer order then populate
						*	the customer id
						*/
						Customer_orders.findOne({id : new_cust_order.id}).populate('customer_id')
							.exec(function(err, populated_cust_order){

								sails.sockets.blast('customer_orders', {verb : 'created', data : populated_cust_order});								
							});

						DeliveryService.assignOrder(new_cust_order.id, user);
					});				
			});
		});
	},

	test : function(req, res){
		DeliveryService.assignOrder(1, 'Sonic');
	}
};

