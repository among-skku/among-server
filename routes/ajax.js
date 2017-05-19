var async = require('async');
var db = {
	user: require(__path + 'modules/db/user'),
	report: require(__path + 'modules/db/report'),
	regular_schedule: require(__path + 'modules/db/regular_schedule'),
	temporal_schedule: require(__path + 'modules/db/temporal_schedule')
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

exports.syncSchedule = function(req, res) {
	var sync_target = req.query.sync_target || false;
	
	async.waterfall([
		cb => {
			if (!sync_target) {
				cb('invalid parameters');
			}
		},
		cb => {
			if (sync_target === 'calendar') {
				cb(null, 'calendar 동기화 사부작사부작');
				console.log('synchronization to calendar schedule');
			} else if (sync_target === 'skku_portal') {
				cb(null, 'skku_portal 동기화 사부작 사부작.');
				console.log('synchronization to skku_portal schedule');
			} else {
				cb('options is not supported');
			}
		}], function(err, result) {
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

exports.getReport = function(req, res) {
	var team_id = req.params.team_id || false;
	var report_id = req.query.report_id || false;
	
	async.waterfall([
		cb => {
			if (!team_id) {
				cb('team_id 값이 없습니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			if (!report_id) {
				//report_id가 명시되지 않으면 report_id 리스트를 출력
				db.report.find({
					team_id: team_id
				}, {
					report_id: 1
				}, function(err, data) {
					async.map(data, function(item, next) {
						next(null, item.report_id);
					}, function(inner_err, transformed) {
						cb(err, transformed);
					});
					// cb(err, data);
				});
			} else {
				db.report.findOne({
					team_id: team_id,
					report_id: report_id
				}, function(err, data) {
					if (data) {
						cb(err, data);
					} else {
						cb('유효하지 않은 회의록 입니다');
					}
				});
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
	
	// 여기서 시간표를 동기화 합니다.
};

exports.addSchedule = function(req, res) {
	var user_id = req.session.user_id || false;
	var type = req.body.type || false;
	var schedule_id = 'report_' + randString(10);
	//regular, temporal 둘다 필수 항목
	var place = req.body.place || false;
	var title = req.body.title || false;
	var contents = req.body.contents || false;
	//date는 new Date().getTime() 형식의 Integer로 입력 받음
	var start_date = req.body.start_date || false;
	var end_date = req.body.end_date || false;
	// regular schedule에만 필요함
	//time은 22:35와 같은 형식의 string으로 입력받음
	var start_time = req.body.start_time || false;
	var end_time = req.body.end_time || false;
	var day = req.body.day || false;
	
	async.waterfall([
		cb => {
			if (!user_id) {
				cb('need session');
			} else if (!type) {
				cb('type is not specified');
			} else if (type !== 'temporal' && type !== 'regular') {
				cb('invalid type is given');
			} else if (!place || !title || !contents || !start_date || !end_date) {
				cb('insufficient parameters');
			} else {
				if (type === 'temporal') {
					cb(null);
				} else if (type == 'regular') {
					if (!start_time || !end_time || !day) {
						cb('insufficient paramters for regular schedule');
					} else {
						cb(null);
					}
				}
			}
			
		},
		cb => {
			if (type === 'temporal') {
				var snapshot = new db.temporal_schedule({
					user_id: user_id,
					schedule_id: schedule_id,
					place: place,
					title: title,
					contents: contents,
					start_date: str2date(start_date),
					end_date: str2date(end_date)
				});
								
				snapshot.save(function(err) {
					cb(err, '비정기 일정이 저장되었습니다.');
				});
			} else {//regular schedule
				var snapshot = new db.regular_schedule({
					user_id: user_id,
					schedule_id: schedule_id,
					place: place,
					title: title,
					contents: contents,
					start_date: str2date(start_date),
					end_date: str2date(end_date),
					start_time: start_time,
					end_time: end_time,
					day: day
				});
				snapshot.save(function(err) {
					cb(err, '정기 일정이 저장되었습니다.');
				});
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

exports.getUserSchedule = function(req, res) {
	var user_id = req.session.user_id;
	// 'all' | 'temporal' | 'regular'
	var type = req.query.type || false;
	
	async.waterfall([
		cb => {
			if (!type) {
				cb('type is not specified');
			} else if (type !== 'all' && type !== 'temporal' && type !== 'regular') {
				cb('invalid type is given');
			} else {
				cb(null);
			}
		},
		cb => {
			async.parallel({
				temporal: function(pcb) {
					if (type === 'all' || type === 'temporal') {
						db.temporal_schedule.find({
							user_id: user_id
						}, function(err, tmp_data) {
							pcb(err, tmp_data);
						});
					} else {
						pcb(null);
					}
				},
				regular: function(pcb) {
					if (type === 'all' || type === 'regular') {
						db.regular_schedule.find({
							user_id: user_id
						}, function(err, reg_data) {
							pcb(err, reg_data); 
						})
					} else {
						pcb(null);
					}
				}
			}, function(err, pdata) {
				cb(err, pdata);
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

exports.modifyReport = function(req, res) {
	var team_id = req.params.team_id || false;
	var report_id = req.body.report_id || false;
	var title = req.body.title || false;
	var contents = req.body.contents || false;
	var attendee = req.body.attendee || false;
	var update_time = new Date();
	
	if (attendee) {
		try {
			attendee = JSON.parse(attendee);
			if (!Array.isArray(attendee)) {
				throw 'attendee format is not array';
			}
		} catch (e) {
			console.log('routes/ajax.js modifyReport attendee JSON parse error', e);
			attendee = false;
		}
	}
	
	async.waterfall([
		cb => {
			if (!report_id || !team_id) {
				cb('report_id, team_id가 지정되지 않았습니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			var write_data = {
				report_id: report_id,
				team_id: team_id,
				update_time: update_time
			};
			if (title) { write_data.title = title; }
			if (contents) { write_data.contents = contents; }
			if (attendee) { write_data.attendee = attendee; }
			
			db.report.update({
				report_id: report_id,
				team_id: team_id
			}, {
				$set: write_data
			}, function(err) {
				if (err) {
					cb(err);
				} else {
					cb(null, '회의록 내용이 정상적으로 수정되었습니다.');
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

exports.createReport = function(req, res) {
	var team_id = req.params.team_id || false;
	var report_id = 'report_' + randString(10);
	var title = req.body.title || '';
	var contents = req.body.contents || '';
	var writer_id = req.session.user_id;
	var create_time = new Date();
	var update_time = create_time;
	
	async.waterfall([
		cb => {
			if (!team_id) {
				cb('team_id가 지정되지 않았습니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			var snapshot = new db.report({
				team_id: team_id,
				report_id: report_id,
				title: title,
				contents: contents,
				attendee: [writer_id],
				writer_id: writer_id,
				create_time: create_time,
				update_time: update_time
			});
			
			snapshot.save(function(err) {
				if (err) {
					cb(err);
				} else {
					cb(null, '성공적으로 저장되었습니다.');
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

exports.deleteReport = function(req, res) {
	var team_id = req.params.team_id || false;
	var report_id = req.body.report_id || false;
	
	async.waterfall([
		cb => {
			if (!team_id || !report_id) {
				cb('team_id나 report_id가 없습니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			db.report.remove({
				team_id: team_id,
				report_id: report_id
			}, function(err) {
				if (err) {
					cb(err);
				} else {
					cb(null, '정상적으로 회의록이 삭제되었습니다.');
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