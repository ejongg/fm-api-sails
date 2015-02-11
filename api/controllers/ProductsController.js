/**
 * ProductsController
 *
 * @description :: Server-side logic for managing products
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	delete : function(req, res){
		var product_id = req.params.id;

		if(product_id && req.isSocket){
			Products.findOne({id : product_id})
				.exec(function(err, found){
					Products.destroy(found.id)
						.exec(function(err){
							Products.publishDestroy(found.id);
						});
				});
		}else if(req.isSocket){
			Products.subscribe(req.socket);
		}
	}
};

