jQuery(function($) {
	
	var draw_team_list = function(team_list_res) {
		if (team_list_res && team_list_res.result && team_list_res.result.length > 0) {
			var team_list_str = JSON.stringify(team_list_res.result);
			var team_list = JSON.parse(team_list_str);
			var team_list_html = [];
			
			team_list.map( function (item, index) {
				team_list_html.push(['<div class="col-xs-6 col-sm-3 pricing-box joined_team_list">',
										'<div class="widget-box widget-color-blue">',
											'<div class="widget-header">',
												'<h5 class="widget-title bigger lighter">',item.team_name,'</h5>',
											'</div>',
											'<div class="widget-body">',
												'<div class="widget-main">',
													'<p>',item.contents,'</p>',
													// '<hr />',
													// '<div class="price">',
													// 	'$15',
													// 	'<small>/month</small>',
													// '</div>',
												'</div>',
												'<div>',
													'<a href="team_schedule/',item.team_id, '\"',' class="btn btn-block btn-primary">',							  		   
														'<span>팀으로 이동</span>',								   							
													'</a>',
												'</div>',
											'</div>',
										'</div>',
									'</div>'].join(''));		
			});
			console.log('team_list_html',team_list_html);
			$('.joined_team_list').remove();
			$("#print_invitation").append(team_list_html.join(''));
		} else {
			console.log('참여한 팀 정보가 없습니다.');
		}	
	};
	async.parallel([
		function(cb) {
			$.get('/user/invite', function (res) {
				cb(null, res);
			});
		},
		function(cb) {
			$.get('/user/team_list', function(res) {
				cb(null, res);
			});
		}
	], function(err, result) {
		var invite_res = result[0];
		var team_list_res = result[1];
		console.log('초대받은 정보',invite_res);
		console.log('stringified', JSON.stringify(invite_res, null, 4));
		if (invite_res && invite_res.result && invite_res.result.length > 0) {
			var user_invitation_str = JSON.stringify(invite_res.result);
			var user_invitation = JSON.parse(user_invitation_str);
			var invitation_html = [];
			
			user_invitation.map(function(item, index) {
				invitation_html.push([
					'<div class = "alert alert-success">',
						'팀 "', item.team_name ,'" 에서 초대가 도착하였습니다.',
						'<button class= "btn btn-xs btn-danger pull-right reject_invit_btn" invitation_id="' + item.invitation_id +'" >',
							'<i class="ace-icon fa fa-times">',
							'</i>',
							'<span class="bigger-110">초대 거절</span>',
						'</button>',
						'<button class="btn btn-xs btn-success pull-right accept_invit_btn" invitation_id="'+ item.invitation_id + '">',
							'<span class="bigger-110">초대 승낙</span>',
							'<i class="ace-icon fa fa-arrow-right icon-on-right">',
							'</i>',
						'</button>',
					'</div>'
				].join(''));
			});
			
			$("#print_invitation").html(invitation_html.join(''));
		
			$(document).on('click', '.reject_invit_btn', function(e) {
				var invitation_id = $(this).attr('invitation_id');
				var toast_dom = $(this).parent();
				$.delete('/user/invite', {
					invitation_id: invitation_id
				}, function(res) {
					if (res) {
						if (res.err) {
							alert(res.err);
						} else {
							alert(res.result);
							toast_dom.remove();
						}
					} else {
						alert('네트워크 에러!, 초대 거절에 실패했습니다.');
					}
				});
			});
			
			$(document).on('click', '.accept_invit_btn', function(e) {
				var invitation_id = $(this).attr('invitation_id');
				var toast_dom = $(this).parent();
				$.post('/user/invite', {
					invitation_id: invitation_id
				}, function(res) {
					if (res) {
						if (res.err) {
							alert(res.err);
						} else {
							alert(res.result);
							toast_dom.remove();
							$.get('/user/team_list', function(res) {
								draw_team_list(res);
							});
						}
					} else {
						alert('네트워크 에러!, 초대 승낙에 실패했습니다.');
					}
				});
			});
			
		} else {
			console.log('초대받은 정보가 없습니다.');
		}
		
		draw_team_list(team_list_res);
		
		
		
	});
});
