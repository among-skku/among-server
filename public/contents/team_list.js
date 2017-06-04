jQuery(function($) {
	$(document).ready(function(){
		$.get('/user/team_list', function(res) {
			if (res && res.result && res.result.length > 0) {
			//alert(Object.values(res.result));
			//alert(whichIsVisible()[0]);
				var team_data_str = JSON.stringify(res.result);
				var team_data = JSON.parse(team_data_str);
				//alert("Data: " +  team_data.length + "\nStatus: " + team_data_str);
				
				/*for (var i=0; i<team_data.length; i++)
					alert("i: "+i+" team[i]: " + team_data[i].team_id);*/
				
				var modal_html = [];
				
				for (var i=0; i<team_data.length; i++) {
					//alert("key: "+i+"   team[key]: "+team_data[i].team_name);
					
					modal_html += ['<div class="col-xs-6 col-sm-3 pricing-box">',
										'<div class="widget-box widget-color-blue">',
											'<div class="widget-header">',
												'<h5 class="widget-title bigger lighter">',team_data[i].team_name,'</h5>',
											'</div>',
											'<div class="widget-body">',
												'<div class="widget-main">',
													'<p>',
														'LLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
													'</p>',
													'<hr />',
													'<div class="price">',
														'$15',
														'<small>/month</small>',
													'</div>',
												'</div>',
												'<div>',
													'<a href="#" class="btn btn-block btn-primary">',
														'<i class="ace-icon fa fa-shopping-cart bigger-110"></i>',
														'<span>팀으로 이동</span>',
													'</a>',
												'</div>',
											'</div>',
										'</div>',
									'</div>'].join('');				
				}
				//alert(modal_html);
				$("#print_team").html(modal_html);
			}			
		});		
	});	
});