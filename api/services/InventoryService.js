var async = require('async');
var moment = require('moment');

module.exports = {
	
	deduct : function (sku_id, bottles, cases, bottlespercase, exp_date){
		var company;
		var bay_id;

		async.series([
			function getSkuCompany(cb_series){
				Sku.findOne({sku_id : sku_id}).populate('prod_id')
					.then(function(sku){
						company = sku.prod_id.company;
						cb_series();
					});
			},

			function getMovingPile(cb_series){
				Bays.findOne({pile_status : "Moving pile", bay_label : company})
					.then(function(bay){
						bay_id = bay.id;
						cb_series();
					});
			},

			function updateInventory(cb_series){
				Inventory.find({sku_id : sku_id, bay_id : bay_id})
					.then(function(skus){
						var index = 0;

						async.whilst(
							function condition(){
								return cases > 0 || bottles > 0;
							},

							function bottlesAndCasesHandler(cb_while){
								var current_physical_count = skus[index].physical_count;
								var current_bottles_count = skus[index].bottles;

								if(skus[index].physical_count > 0){

									if(bottles > 0){
										skus[index].bottles = Math.max(0, skus[index].bottles - bottlespercase);
										skus[index].physical_count = Math.max(0, skus[index].physical_count - 1);
										skus[index].logical_count = Math.max(0, skus[index].logical_count - 1);								
										skus[index].save(function(err, saved){});

										var inc_case = {
											sku_id : sku_id,
											exp_date : exp_date,
											bottles : bottlespercase - bottles
										};

										Incomplete_cases.create(inc_case).exec(function(err, incompletes){});

										bottles = 0;
									}

									if(cases > 0){
										if(skus[index].physical_count > 0){
											skus[index].bottles = Math.max(0, skus[index].bottles - (cases * bottlespercase));
											skus[index].physical_count = Math.max(0, skus[index].physical_count - cases);
											skus[index].logical_count = Math.max(0, skus[index].logical_count - cases);
											skus[index].save(function(err, saved){});

											if(skus[index].physical_count > cases){
												cases = 0;
											}else{
												cases = cases - current_physical_count;
												index++;
											}
										}
									}							

								}else{
									index++;
								}

								cb_while();
							},

							function(err){
								if(err)
									console.log(err);

								cb_series();
							}
						);
						
					});
			}
		]);
	},

	put : function(sku_id, cases, bottlespercase, bay_id, exp_date, lifespan){
		
		Inventory.findOne({sku_id : sku_id, bay_id : bay_id, exp_date : exp_date})
			.then(function findInInventory(found_sku){
				if(found_sku){
					found_sku.bottles = found_sku.bottles + (bottlespercase * cases);
					found_sku.physical_count = found_sku.physical_count + cases;
					found_sku.logical_count = found_sku.logical_count + cases;

					found_sku.save(function(err, saved){});
				}else{
					var item = {
						bay_id : bay_id,
						sku_id : sku_id,
						exp_date : moment(exp_date, 'YYYY-MM-DD').add(lifespan, 'M'),
						bottles : cases * bottlespercase,
						physical_count : cases,
						logical_count : cases
					};

					Inventory.create(item).exec(function(err, created){});
				}		
			},

			function(err){
				console.log(err);
			});
	},

	LO_deduct : function(sku_id, cases, bottlespercase){
		Inventory.find({sku_id : sku_id})
			.then(function(skus){
				var index = 0;

				async.whilst(
					function condition(){
						return cases > 0;
					},

					function bottlesAndCasesHandler(cb){
						var current_physical_count = skus[index].physical_count;

							if(cases > 0){
								if(skus[index].physical_count > 0){
									skus[index].bottles = Math.max(0, skus[index].bottles - (cases * bottlespercase));
									skus[index].physical_count = Math.max(0, skus[index].physical_count - cases);
									skus[index].save(function(err, saved){});

									if(skus[index].physical_count > cases){
										cases = 0;
									}else{
										cases = cases - current_physical_count;
										index++;
									}
								}else{
									index++;
								}
							}

						cb();		
					},

					function(err){
						if(err)
							console.log(err);
					}
				);
				
			})
	}
};