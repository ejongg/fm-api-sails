/**
 * AddressController
 *
 * @description :: Server-side logic for managing addresses
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	assign_route : function(req, res){
		var routeName = req.body.route_name;
		var addressList = req.body.address;
		var updatedAddressList = [];

		Routes.findOrCreate({route_name : routeName})
			.then(function (route){
				async.each(addressList, function (address, cb){
					Address.update({id : address.id}, {route_id : route.id})
						.then(function (updatedAddress){
							updatedAddressList.push(updatedAddress);
							cb();
						},

						function(err){
							cb(err);
						});
				}, function(err){
					if(err) return res.send(err);

					return res.send(updatedAddressList);
				});
			})

			.catch(function(err){
				return res.send(err);
			});
	}
};

