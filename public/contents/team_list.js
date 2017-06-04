jQuery(function($) {
	$(document).ready(function(){
		
		$.get('/user/invite', function (res) {
			if (res && res.result && res.result.length > 0) {
				var user_invitation_str = JSON.stringify(res.result);
				var user_invitation = JSON.parse(user_invitation_str);
				
				var modal_html = [];
				
				for (var i=0; i<user_invitation.length; i++) {
					if (user_invitation[i].state == 'Pending') {
						modal_html += ['<div class = "alert alert-success">',
									'"팀 초대장"',
									'<button class= "btn btn-xs btn-danger pull-right" id="reject_invitation">',
										'<i class="ace-icon fa fa-times">',
										'</i>',
										'<span class="bigger-110">I don\'t accept</span>',
									'</button>',
									'<button class="btn btn-xs btn-success pull-right" id="accept_invitation">',
										'<span class="bigger-110">I accept</span>',
										'<i class="ace-icon fa fa-arrow-right icon-on-right">',
										'</i>',
									'</button>',
								'</div>'].join('');
					}
				}
			}
		});
		
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
													'<p>',team_data[i].contents,'</p>',
													'<hr />',
													'<div class="price">',
														'$15',
														'<small>/month</small>',
													'</div>',
												'</div>',
												'<div>',
													'<a href="team_schedule/',team_data[i].team_id, '\"',' class="btn btn-block btn-primary">',							   
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