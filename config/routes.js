/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {
	/* 	USERS		
		login - for user login
		changepassword - for changing password of users
	*/
	'POST /users/login' : 'Users.login',
	'POST /users/changepassword' : 'Users.changepassword',

	/* 	BAD ORDERS
		add - for creating bad orders
	*/
	'POST /bad-orders/add' : 'Bad_orders.add',
	'GET  /bad-orders/details' : 'Bad_orders.getBadOrderProducts',

	/* 	BAYS 
		add - for creating bays
		bayitems - for listing the bays with their total product count
	*/
	'POST /bays/add' : 'Bays.add',
	'GET  /bays/list' : 'Bays.list',

	/* 	CUSTOMER ORDERS 
		add - for creating customer orders
		list - for listing customer orders
	*/
	'POST /customer-orders/add' : 'Customer_orders.add',
	'GET  /customer-orders/list' : 'Customer_orders.list',
	'GET  /customer-orders/details' : 'Customer_orders.getOrderDetails',

	/* DELIVERY

	*/

	'POST /delivery/remove' : 'Delivery_transactions.remove',
	'GET  /delivery/details' : 'Delivery_transactions.getTransactionDetails',

	/* 	EMPLOYEES 
		add - for creating employees
	*/
	'POST /employees/add' : 'Employees.add',
	'GET  /employees/list' : 'Employees.list',

	/* 	INVENTORY 
		list - for listing the contents of inventory
	*/
	'GET /inventory/list' : 'Inventory.getInventory',

	/* 	LOAD IN 
		add - for creating load ins
	*/
	'POST /load-in/add' : 'Load_in.add',

	/* 	LOAD OUT 
		add - for creating load outs
		confirm - for confirming load outs
		list - for listing load outs
	*/
	'POST /load-out/add' : 'Load_out.add',
	'POST /load-out/confirm' : 'Load_out.confirm',
	'GET  /load-out/list' : 'Load_out.list',

	/* 	PURCHASES 
		add - for creating purchases
	*/
	'POST /purchases/add' : 'Purchases.add',
	'GET  /purchases/details' : 'Purchases.getPurchaseDetails',
	/* 	ADDRESS 
		remove - removes the address from its current route
	*/
	'GET /address/list' : 'Address.getList',
	'PUT /address/edit' : 'Address.edit',
	'POST /address/remove' : 'Address.remove',

	/* 	ROUTES 
		add - for creating routes
	*/
	'POST /routes/add' : 'Routes.add',

	/* 	SKU 
		available - for listing products in inventory that has total count > 0
	*/
	'GET /sku/available' : 'Sku.available',

	/* 	TRUCKS 
		add - for creating trucks
	*/
	'POST /trucks/add' : 'Trucks.add',
	'POST /trucks/edit' : 'Trucks.edit',

	/* 	WAREHOUSE TRANSACTIONS 
		add - for creating warehouse transactions
	*/
	'POST /warehouse-transactions/add' : 'Warehouse_transactions.add',
	'GET  /warehouse-transactions/details' : 'Warehouse_transactions.getTransactionDetails',	

	/* REPORTS */
  	'GET /reports/dssr' : 'Reports.getDssr',
  	'GET /reports/transactions' : 'Reports.getTransactions',

  	/* MOBILE */
  	'POST /mobile/login' : 'UsersController.mobileLogin'
};
