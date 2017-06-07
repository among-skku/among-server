jQuery(function($) {
		
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
		console.log(1,invite_res);
		console.log(2,team_list_res);
		if (invite_res && invite_res.result && invite_res.result.length > 0) {
			var user_invitation_str = JSON.stringify(invite_res.result);
			var user_invitation = JSON.parse(user_invitation_str);
			var invitation_html = [];
			
			console.log('user_invitation', user_invitation);
			user_invitation.map( function(item, index){
				if (user_invitation[index].state === 'Pending') {
					invitation_html += ['<div class = "alert alert-success">',
									'팀',user_invitation[index].team_id,'에서 초대가 도착하였습니다.',
									'<button class= "btn btn-xs btn-danger pull-right\" id="reject_invitation_',index,'\">',
										'<i class="ace-icon fa fa-times">',
										'</i>',
										'<span class="bigger-110">I don\'t accept</span>',
									'</button>',
									'<button class="btn btn-xs btn-success pull-right" id="accept_invitation_',index,'\">',
										'<span class="bigger-110">I accept</span>',
										'<i class="ace-icon fa fa-arrow-right icon-on-right">',
										'</i>',
									'</button>',
								'</div>'].join('');
				}
			});
			
			$("#print_invitation").html(invitation_html);
			
			///////////////////////////////////////////////////Numbering 문제 해결 필요
			// 초대 버튼 연결 성공
			$("#accept_invitation_0").click(function(e) {
				$.post('/user/invite', {
					invitation_id: user_invitation[0].invitation_id
				}, function (res) {
					if (res.err) {
						alert(res.err);
					} else {
						alert(res.result);
					}
				});
			});
			
			// 거절 버튼 연결 성공
			$("#reject_invitation_1").click(function(e) {
				$.delete('/user/invite', {
					invitation_id: user_invitation[1].invitation_id
				}, function (res) {
					if (res.err) {
						alert(res.err);
					} else {
						alert(res.result);
					}
				});
			});
			
		} else {
			console.log('1 not@@@');
		}
		
		if (team_list_res && team_list_res.result && team_list_res.result.length > 0) {
			var team_list_str = JSON.stringify(team_list_res.result);
			var team_list = JSON.parse(team_list_str);
			var team_list_html = [];
			
			// alert("team_list 길이: " + team_list_res.result.length);
			// alert("team: " + team_list_str);
			
			console.log('team_list;', team_list);
			team_list.map( function (item, index) {
				team_list_html.push(['<div class="col-xs-6 col-sm-3 pricing-box">',
										'<div class="widget-box widget-color-blue">',
											'<div class="widget-header">',
												'<h5 class="widget-title bigger lighter">',team_list[index].team_name,'</h5>',
											'</div>',
											'<div class="widget-body">',
												'<div class="widget-main">',
													'<p>',team_list[index].contents,'</p>',
													'<hr />',
													'<div class="price">',
														'$15',
														'<small>/month</small>',
													'</div>',
												'</div>',
												'<div>',
													'<a href="team_schedule/',team_list[index].team_id, '\"',' class="btn btn-block btn-primary">',							  		   
														'<span>팀으로 이동</span>',								   							
													'</a>',
												'</div>',
											'</div>',
										'</div>',
									'</div>'].join(''));		
			});
			console.log('team_list_html',team_list_html);
			// $("#print_team").html(team_list_html.join(''));
			$("#print_invitation").append(team_list_html.join(''));
		} else {
			console.log('not!!!');
		}
		
	});
});
	//////////////////
		/*$.get('/user/invite', function (res) {
			if (res && res.result && res.result.length > 0) {
				var user_invitation_str = JSON.stringify(res.result);
				var user_invitation = JSON.parse(user_invitation_str);
				
				var invitation_html = [];
				
				for (var i=0; i<user_invitation.length; i++) {
					if (user_invitation[i].state == 'Pending') {
						invitation_html += ['<div class = "alert alert-success">',
									'팀',user_invitation[i].team_id,'에서 초대가 도착하였습니다.',
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
				
				$("#print_invitation").html(invitation_html);
			}
		});
		
		$.get('/user/team_list', function(res) {
			
			
			if (res && res.result && res.result.length > 0) {
			
				var team_data_str = JSON.stringify(res.result);
				var team_data = JSON.parse(team_data_str);
				var modal_html = [];				
				
			//	/*for (var i=0; i<team_data.length; i++)
				//	alert("i: "+i+" team[i]: " + team_data[i].team_id);					
				
				for (var i=0; i<team_data.length; i++) {
					alert("key: "+i+"   team[key]: "+team_data[i].team_name);
					
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
														'<span>팀으로 이동</span>',								   							
													'</a>',
												'</div>',
											'</div>',
										'</div>',
									'</div>'].join('');				
				}
				alert(modal_html);
				$("#print_team").html(modal_html);
			} //*else {
			//	alert('참여하는 팀 없음');
				//modal_html = '<p>현재 잠여하고 있는 팀이 없습니다.</p>'.join[''];
			//}	
			
		});		*/
	//});	
//});

/*jQuery(function($) {
	
	async.waterfall([
		cb => {
			$.get('user/invite', function (res) {
				if (res && res.result && res.result.length>0) {
					var user_invitation_str = JSON.stringify(res.result);
					var user_invitation = JSON.parse(user_invitation_str);
					var invitation_html = [];
					
					for (var i=0; i<user_invitation.length; i++) {
						if (user_invitation[i].state === 'Pending') {
							invitation_html += ['<div class = "alert alert-success">',
									'팀',user_invitation[i].team_id,'에서 초대가 도착하였습니다.',
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
		}
	], function (err, result) {
		$("#print_invitation").html(result);
	});
});*/