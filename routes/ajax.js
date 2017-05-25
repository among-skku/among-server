var async = require('async');

var db = {
	user: require(__path + 'modules/db/user'),
	chat: require(__path + 'modules/db/chat'),
	chat_data: require(__path + 'modules/db/chat_data'),
	notice: require(__path + 'modules/db/notice'),
	team: require(__path + 'modules/db/team'),
	
};

exports.loginUser = function(req, res) {
	if (Object.keys(req.query).length) {
		req.body = req.query;
	}
		
	var user_id = req.body.user_id || "";
	var password = req.body.password || "";
	async.waterfall([
		cb => {
			if (!user_id || !password) {
				return cb('please insert id and password');
			}
			cb(null);
		},
		cb => {
			db.user.findOne({
				user_id: user_id,
				password: password
			}, function(err, user_data) {
				if (err) {
					return cb(err);
				}
				if (!user_data) {
					return cb('invalid id or password');
				} 
				req.session.regenerate(function(err) {
					
					req.session.user_id = user_data.user_id;
					req.session.user_name = user_data.user_name;
					req.session.email = user_data.email;
					req.session.phone = user_data.phone;

					cb(err, '로그인 성공');
				});
			});
		}
	], function(err, result) {
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.json({
				result: result
			})
		}
	});
};

exports.logoutUser = function(req, res) {
	req.session.destroy();
	
	if (req.session) {
		res.json({
			err: '로그아웃 실패'
		});
	} else {
		res.json({
			result: '로그아웃 성공'
		})
	}
};

exports.signupUser = function(req, res) {
	if (Object.keys(req.query).length) {
		req.body = req.query;
	}
	
	var user_id = req.body.user_id || "";
	var user_name = req.body.user_name || "";
	var password = req.body.password || "";
	var email = req.body.email || "";
	var phone = req.body.phone || "";
	
	async.waterfall([
		cb => {
			if (!user_id || !user_name || !password) {
				cb('invalid inputs');
			} else {
				cb(null);
			}
		},
		cb => {
			db.user.findOne({
				user_id: user_id
			}, function(err, result) {
				if (err) {
					return cb(err);
				}
				cb(null, result);
			});
		},
		(user_data, cb) => {
			if (user_data) {
				return cb('user data already exist');
			}
			var snapshot = new db.user({
				user_id: user_id,
				user_name: user_name,
				password: password,
				email: email,
				phone: phone
			});
			
			snapshot.save(function(err) {
				if (err) {
					cb(err);
				} else {
					cb(null, '회원가입 성공!');
				}
			});
		}
	], function(err, result) {
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.json({
				result: result
			});
		}
	});
};

exports.getUserById = function(req, res) {
	if (Object.keys(req.query).length) {
		req.body = req.query;
	}
	var user_id = req.body.user_id || req.session.user_id || '';
	
	async.waterfall([
		cb => {
			if (!user_id) {
				cb('정보를 불러올 유저 정보가 명시되지 않았습니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			db.user.findOne({
				user_id: user_id
			}, function(err, data) {
				cb(err, data);
			})
		},
		(user_data, cb) => {
			if (!user_data) {
				cb('해당 유저 정보가 없습니다.');
			} else {
				cb(null, user_data);
			}
		}
	], function(err, result) {
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.json({
				result: result
			});
		}
	});
};

exports.updateUser = function(req, res) {
	if (Object.keys(req.query).length) {
		req.body = req.query;
	}
	
	var user_id = req.body.user_id || '';
	// var user_name = req.body.user_name || '';
	// var email = req.body.email || '';
	// var password = req.body.password || '';
	// var phone = req.body.phone || '';
	
	var update_data = {};
	var attr_list = ['user_name', 'email', 'password', 'phone'];
	
	attr_list.map(function(attr) {
		if (req.body[attr]) {
			update_data[attr] = req.body[attr];
		}
	});
	
	async.waterfall([
		cb => {
			if (!user_id) {
				cb('user_id가 지정되지 않았습니다.');
			} else {
				cb(null);
			}
		}, 
		cb => {
			db.findOne({
				user_id: user_id
			}, function(err, user_data) {
				cb(err, user_data);
			})
		},
		(user_data, cb) => {
			if (user_data) {
				db.update({
					user_id: user_id,
					
				}, update_data, function(err, result) {
					if (err) {
						cb(err);
					} else {
						cb(null, '유저 정보 변경 성공');
					}			
				});
			} else {
				cb('없는 유저입니다.');
			}
		}
	], function(err, result) {
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.json({
				result: result
			});
		}
	});
};

exports.sendChat = function (req, res) {	
	
	if (Object.keys(req.query).length) {
		req.body = req.query;
	}
	
	var team_id =  req.params.team_id || '';
	var sender_id = req.body.sender_id || req.session.user_id || '';
	var message_id = "msg_" + randString(10);
	var time = new Date();
	var contents = req.body.contents;
	
	async.waterfall([
		//cb => {
			// 데이터 부족
		//},		
		cb => {
			var chat_info = new db.chat ({
				team_id: team_id,
				sender_id: sender_id,
				message_id: message_id,
				time: time
			});				
			
			chat_info.save(function(err) {
				if (err) {
					cb(err);
				}
				else {
					cb(null, '메세지 정보 추가');					
				}
			});			
		},
		
		(data,cb) => {
			var chat_msg = new db.chat_data ({
				message_id: message_id,
				contents: contents
			});				
			
			chat_msg.save(function(err) {
				
				if (err) {
					cb(err);
				}
				else {
					cb(null, ' 메세지 추가');
				}
			});
		}
	], function(err, result) {
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.json({
				result: result
			});
		}
	});	
};

/*exports.searchChatting = function(req, res) {
	
	if (Object.keys(req.query).length) {
		req.body = req.query;		
	}
	
	var team_id = req.params.team_id || '';
	var pattern = req.body.pattern || '';	
		
	async.waterfall([
		cb => {
			if (!pattern) {
				cb('검색할 내용이 명시되지 않았습니다.');
			} else {				
				cb(null);
			}
		},
		cb => {
			db.chat_data.find({
				contents: {$regex: pattern, $options: 'i'}
			}, function(err, data) {
				cb(err, data);
			})			
		},
		(data, cb) => {
			
			var searchResult = [];			
			var cbflag = 0;
			for (var idx in data) {			
				
				db.chat.find({message_id: data[idx].message_id}, 
							 function(err, db_result) {
					
					if (err) cb(null);					
					
					var result_tmp = {
						team_id: team_id,
						sender_id: db_result[0].sender_id,
						contents: data[idx].contents,
						time: db_result[0].time,
						message_id: db_result[0].message_id,
					}				
							
					searchResult.push(result_tmp);
					
					cbflag++;
					if (cbflag == data.length) {
					
						// 시간 순서대로 정렬 - Descending order
						searchResult.sort(function(obj1, obj2) {
							return obj2.time - obj1.time;
						});
						cb(null, searchResult);
					}
				});				
			}			
		},
		(searchResult, cb) => {			
			if (searchResult.length == 0) {
				cb('해당 단어가 없습니다.');
			} else {
				cb(null, searchResult);
			}
		}
	], function(err, searchResult) {
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.json({
				result: searchResult
			});
		}
	});	
}*/

exports.searchChatting = function (req, res) {
	
	if (Object.keys(req.query).length) {
		req.body = req.query;		
	}
	
	var team_id = req.params.team_id || '';
	var pattern = req.body.pattern || '';
	
	async.waterfall([
		cb => {
			if (!pattern) {
				cb('검색할 내용이 명시되지 않았습니다.');
			} else {				
				cb(null);
			}
		},
		cb => {
			db.chat_data.find({
				contents: {$regex: pattern, $options: 'i'}
			}, function(err, data) {
				cb(err, data);
			})			
		},
		(data, cb) => {
			
			// mapLimit Error 처리 문제
			async.mapLimit(data, 100, function(item, next) {				
				db.chat.findOne({
					message_id: item.message_id
				}, function (err, message_data) {
					if (err) {
						item.contents = "Fail loading data";
						next(err);
					} else {
						item.sender_id = message_data.sender_id;
						item.time = message_data.time;
						next(null, item);
					}
				});				
			}, function (err, merged_data) {
				if (err) {
					console.log('chat message merging failed');
				} else {
					console.log(merged_data);
					cb(err, merged_data);
				}
			});			
		}			
	], function(err, searchResult) {
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.json({
				result: searchResult
			});
		}
	});	
}


exports.getTeamChat = function (req, res) {
		
	if (Object.keys(req.query).length) {
		req.body = req.query;		
	}
	
	var team_id = req.params.team_id || '';
	var skip = req.body.skip || '';
	var limit = req.body.limit || '';	
	
	async.waterfall([
		cb => {			
			db.chat.find({team_id: team_id})
				.sort({time: -1}).skip(parseInt(skip)).limit(parseInt(limit))
				.exec(function (err, data) {
				cb(err, data);
			});				
		},		
		(data, cb) => {						
			// Error 처리 문제 -> Error가 있을 때 중지
			async.mapLimit(data, 10, function(item, next) {
				db.chat_data.findOne({
					message_id: item.message_id
				}, function(err, message_data) {
					if (err) {
						item.contents = "Fail loading data";
						next(err);
					} else {
						item.contents = message_data.contents;
						next(null, item);
					}
				})
			}, function(err, merged_data) {
				if (err) {
					console.log('chat message merging failed');
				} else {
					console.log(merged_data);
					cb(err, merged_data);
				}
			});			
		}	
	], function (err, result) {
		
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.json({
				result: result
			});
		}		
	});	
}


exports.addNotice = function (req, res) {
	
	if (Object.keys(req.query).length) {
		req.body = req.query;		
	}
	
	var team_id = req.params.team_id || '';
	var speaker_id = req.body.speaker_id || req.session.user_id || '';
	var notice_id = "noti_" + randString(10);
	var title = req.body.title;
	var contents = req.body.contents;
	var create_time = new Date();	
	
	async.waterfall([
		
		cb => {			
			var notice_info = new db.notice({
				team_id : team_id,
				speaker_id : speaker_id,
				notice_id : notice_id,
				title : title,
				contents : contents,
				create_time : create_time			
			});
			
			notice_info.save( function (err) {
				if (err) {
					cb(err);
				}
				else {
					cb(null, 'Notice 추가');
				}				
			});			
		},		
	], function(err, result) {
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.json({
				result: result
			});
		}
	});	
}
				
exports.getNotice = function (req, res) {
	
	if (Object.keys(req.query).length) {
		req.body = req.query;		
	}
	
	var team_id = req.params.team_id || '';
	var limit = req.body.limit || '';	
	
	async.waterfall([
		cb => {
			db.notice.find({
				team_id: team_id}).
			 sort({create_time : -1}).limit(parseInt(limit)).exec( function(err, data) {
				cb(err, data);
			});			
		}
		/*,
		(data, cb) => {
			data.sort(function(obj1, obj2) {
				return obj2.create_time - obj1.create_time;
			});
			cb(null, data);
		}	*/
	], function (err, result) {
		
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.json({
				result: result
			});
		}		
	});
}

exports.deleteNotice = function (req, res) {	
	
	if (Object.keys(req.query).length) {
		req.body = req.query;		
	}
	
	var team_id = req.params.team_id || '';
	var notice_id = req.body.notice_id;
	
	async.waterfall([
		cb => {
			db.notice.remove({
				//notice_id: notice_id
				$and: [{team_id: team_id}, {notice_id: notice_id}]				
			}, function(err, data) {					
				cb(err, data);
			});			
		}
	], function (err, result) {
		
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.json({
				result: result
			});
		}		
	});	
}

exports.createTeam = function (req, res) {
	
	if (Object.keys(req.query).length) {
		req.body = req.query;		
	}
	
	var team_id = 'team_' + randString(10);
	//var team_id = "team_mj4VfQitGc";
	var team_name = req.body.team_name || "";
	var manager_id = req.body.manager_id || req.session.user_id || '';
	var member_id = req.body.member_id || ""; 
	var contents = req.body.contents || "";
	var deleted = false;
	
	async.waterfall([
		cb => {
			if (!team_name || !manager_id) {
				cb('invalid inputs');
			} else {
				cb(null);
			}
		},
		cb => {
			db.team.findOne({
				team_id: team_id
			}, function(err, result) {
				if (err) {
					return cb(err);
				}
				cb(null, result);
			});
		},
		(team_id_data, cb) => {
			if (team_id_data) {
				return cb('team id already exist');
			}
			var new_team = new db.team({				
				team_id: team_id,
				team_name: team_name,
				manager_id: manager_id,
				member_id: member_id,
				contents: contents,
				deleted: deleted				
			});
			
			new_team.save( function(err) {
				if (err) {
					cb(err);
				} else {
					cb(null, '팀 생성 성공!');
				}
			});
		}
	], function(err, result) {
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.json({
				result: result
			});
		}
	});	
}

exports.getTeamData = function (req, res) {
	
	if (Object.keys(req.query).length) {
		req.body = req.query;		
	}
	
	var team_id = req.params.team_id || "";
	
	async.waterfall([
		cb => {
			if (!team_id) {
				cb('정보를 불러올 팀 정보가 명시되지 않았습니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			db.team.findOne({
				team_id: team_id
			}, function (err, data) {
				cb(err, data);
			})
		},
		(team_data, cb) => {
			if (!team_data) {
				cb('해당 팀에 대한 정보가 없습니다.');
			} else {
				cb(null, team_data);
			}
		}
	], function (err, result) {
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.json({
				result: result
			});
		}
	});	
}

exports.updateTeam = function (req, res) {
	
	if (Object.keys(req.query).length) {
		req.body = req.query;		
	}
	
	var team_id = req.params.team_id || false;
	var team_name = req.body.team_name || false;
	var manager_id = req.body.team_id || false;
	var member_id = req.body.member_id || false;
	var contents = req.body.contents || false;
	
	if (member_id) {
		try {
			member_id = JSON.parse(member_id);
			if (!Array.isArray(member_id)) {
				throw 'member_id format is not array';
			}
		} catch (e) {
			console.log('routes/ajax.js updateTeam member_id JSON parse error', e);
			member_id = false;
		}
	}
	
	async.waterfall ([
		cb => {
			var write_data = {
				team_id: team_id,
			};
			
			if (manager_id) {write_data.manager_id = manager_id;}
			// 매니저 변경은 생각해볼 필요...
			if (team_name) {write_data.team_name = team_name;}
			if (contents) {write_data.contents = contents;}
			
			db.team.update({
				team_id: team_id,
			}, {
				$set: write_data
			}, function (err) {
				if (err) {
					cb(err);
				} else {
					cb(null, '팀 정보가 정상적으로 수정되었습니다.');
				}
			});
		}
	], function (err, result) {
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.json({
				result: result
			});
		}		
	});
}

exports.deleteTeam = function (req, res){

	if (Object.keys(req.query).length) {
		req.body = req.query;		
	}
	
	var team_id = req.params.team_id || '';
	
			// due_date, report, file_manager
			// user에서 team_id  삭제
			// appointment_schedule, team, feed
			
			// invitation 처리??
	
	async.waterfall([
		cb => {
			if (!team_id) {
				cb('삭제할 팀의 정보가 명시되지 않았습니다.');
			} else {
				cb(null);
			}
		},
		cb => { // notice에서 해당 팀의 정보 삭제
			db.notice.remove({
				team_id: team_id				
			}, function(err, result) {					
				cb(err, result);
			});		
		},
		(result, cb) => { // chat, chat_data에서 해당 팀의 정보 삭제
			async.mapLimit(data, 10, function (item, next) {
				db.chat.find({
					team_id: item.team_id
				}, function (err, message_data) {
					if (err) {
						next(err);
					} else {						
						db.chat_data.remove({
							message_id: message_data.message_id
						}, function (err, remove) {						
							if (err) {
								console.log('delete chat_data failed');
							} else {
								console.log(remove);
								cb(err, remove);
							}
						});						
					}
				});
			}, function (err, remove) {
				if (err) {
					console.log(err);
				} else {
					db.chat.remove({
						team_id: team_id				
					}, function(err, result) {					
						cb(err, result);
					});				
				}
			});			
		},
		(team_data, cb) => {
			if (!team_data) {
				cb('해당 팀에 대한 정보가 없습니다.');
			} else {
				cb(null, team_data);
			}
		}
	], function (err, result) {
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.json({
				result: result
			});
		}
	});	
}


exports.ajaxTest = function(req, res) {
	var msg = {
		method: req.method,
		query: req.query,
		body: req.body
	};
	
	console.log('req!:', msg);
	res.send(JSON.stringify(msg));
};

exports.sessChk = function(req, res) {
	console.log('session:', req.session);
	res.json(req.session);
};