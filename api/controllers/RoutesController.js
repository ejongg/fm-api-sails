/**
 * RoutesController
 *
 * @description :: Server-side logic for managing routes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	add : function(req, res){
		var routeName = req.body.route_name;
		var addressList = req.body.address;
		var flag = req.body.flag;
		var updatedAddressList = [];

		Routes.findOrCreate({route_name : routeName}, {route_name : routeName})
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

					Routes.findOne({route_name : routeName}).populate('address')
						.then(function (createdRoute){
							
							if(flag == "add"){
								sails.sockets.blast('routes', {verb : 'created', data : createdRoute});	
							}else if(flag == "edit"){
								sails.sockets.blast('routes', {verb : 'updated', data : createdRoute});	
							}
							
							return res.send("Route created successfully");
						});
				});
			})

			.catch(function(err){
				return res.send(err);
			});
	} 
};

