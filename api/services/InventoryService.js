module.exports = {
	POS_updateInventory : function updateInventory(skus, cases_sold, extra_bottles, bottlespercase){
		var index = 0;

		async.whilst(
			function whileCondition(){return cases_sold > 0},

			function bottlesAndCasesHandler(cb_whilst){
				var current_physical_cases = skus[index].physical_count;
				var current_bottles = skus[index].bottles;

				async.series([
					function bottlesHandler(cb_outer_series){
						if(current_bottles > 0 && extra_bottles > 0){
							async.series([
								function deductBottles(cb_inner_series){
									skus[index].bottles = Math.max(0, skus[index].bottles - extra_bottles);																	
									skus[index].save(function(err, saved){});
									cb_inner_series();
								},

								function deductCaseOfBottles(cb_inner_series){
									if((skus[index].bottles - (skus[index].physical_count * bottlespercase)) < bottlespercase){
										skus[index].physical_count = skus[index].physical_count - 1;
										skus[index].logical_count = skus[index].logical_count - 1;																		
									}
									cb_inner_series();
								}
							], function endOfInnerSeries(err, result){
								cb_outer_series();
							});	

						}else{
							cb_outer_series();
						}
					},

					function casesHandler(cb_outer_series){
						if(current_physical_cases > 0){
							skus[index].bottles = Math.max(0, skus[index].bottles - (cases_sold * bottlespercase));																									
							skus[index].physical_count = Math.max(0, skus[index].physical_count - cases_sold);
							skus[index].logical_count = Math.max(0, skus[index].logical_count - cases_sold);
							skus[index].save(function(err, saved){});

							if(cases_sold < skus[index].physical_count){
								cases_sold = 0;
								cb_outer_series();
							}else{
								cases_sold = cases_sold - current_physical_cases;
								index++;
								cb_outer_series();
							}

						}else{
							index++;
							cb_outer_series();
						}
					}
				]);

				cb_whilst();
			},

			function endOfWhile(err){
				if(err)
					console.log(err);
			}
		); // end of async.whilst
	},

	updateInventory : function updateInventory(sku_id, bottles, cases, bottlespercase){
		Inventory.find({sku_id : sku_id})
			.then(function(skus){
				var index = 0;

				async.whilst(
					function condition(){
						return cases > 0 || bottles > 0;
					},

					function bottlesAndCasesHandler(cb){
						var current_physical_count = skus[index].physical_count;
						var current_bottles_count = skus[index].bottles;

						if(bottles > 0){
							if(skus[index].bottles > 0){
								skus[index].bottles = Math.max(0, skus[index].bottles - bottles);

								if((skus[index].bottles - (skus[index].physical_count * bottlespercase)) < bottlespercase){
									skus[index].physical_count = Math.max(0, skus[index].physical_count - 1);
									skus[index].logical_count = Math.max(0, skus[index].logical_count - 1);								
								}

								if(skus[index].bottles > bottles){
									bottles = 0
								}else{
									bottles = bottles - current_bottles;
								}

								skus[index].save(function(err, saved){});
							}
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