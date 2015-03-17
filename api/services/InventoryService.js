module.exports = {
	
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

						if(skus[index].bottles > 0 || skus[index].physical_count > 0){

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
										bottles = bottles - current_bottles_count;
									}

									skus[index].save(function(err, saved){});
								}
							}

						}else{
							index++;
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