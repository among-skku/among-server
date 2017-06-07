var async = require('async');
var fs = require('fs');
var execFile = require('child_process').execFile;
var mkdirp = require('mkdirp');
var db = {
	user: require(__path + 'modules/db/user'),
	report: require(__path + 'modules/db/report'),
	// regular_schedule: require(__path + 'modules/db/regular_schedule'),
	temporal_schedule: require(__path + 'modules/db/temporal_schedule'),
	team_schedule: require(__path + 'modules/db/team_schedule'),
	chat: require(__path + 'modules/db/chat'),
	chat_data: require(__path + 'modules/db/chat_data'),
	notice: require(__path + 'modules/db/notice'),
	file_manager: require(__path + 'modules/db/file_manager'),
	team: require(__path + 'modules/db/team'),
	invitation: require(__path + 'modules/db/invitation'),
	timetable_image: require(__path + 'modules/db/timetable_image')
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
				return cb('아이디와 패스워드를 모두 입력해주세요.');
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
					return cb('잘못된 아이디나 패스워드입니다.');
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
			});
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
		});
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
				cb('필수 입력값을 모두 채워주세요.');
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
				return cb('중복된 아이디입니다.');
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
			}, {
				password: 0
			}, function(err, data) {
				cb(err, data);
			});
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
			});
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

exports.syncCalendar = function(req, res) {
	var user_id = req.session.user_id || false;
	var json_path = __storage_path + '/time_tables/' + user_id + '.json';
	var img_path = __storage_path + '/time_tables/' + user_id;
	var cwd = __storage_path + '/time_tables/';
	async.waterfall([
		cb => {
			if (!user_id) {
				cb('로그인 하셔야합니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			if (typeof __openCV_bin_path === 'undefined') {
				return cb('이미지 파싱 환경설정이 되어있지 않습니다.');
			}
			if (!fs.existsSync(img_path)) {
				cb('시간표 이미지가 업로드되지 않았습니다.');
			} else if (!fs.existsSync(__openCV_bin_path)) {
				cb('이미지 프로세싱 환경설정이 제대로 되어있지 않습니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			//여기서 openCV 모듈을 붙여서 /storage/time_tables/[유저아이디].json 파일을 만들어내면 됩니다!!
			execFile(__openCV_bin_path, [img_path], {
				cwd: cwd
			}, function(err, stdout, stderr) {
				console.log('err', err);
				console.log('stdout', stdout);
				console.log('stderr', stderr);
				if (err) {
					cb('이미지 프로세싱이 실패했습니다.');
				} else {
					cb(null);
				}
			});
		},
		cb => {
			
			fs.stat(json_path, function(err, stats) {
				if (err) {
					if (err.code === 'ENOENT') {
						cb('시간표 파싱이 제대로 이루어지지 않았습니다.');
					} else {
						cb(err);
					}
				} else {
					if (stats && stats.isFile()) {
						cb(null);
					} else {
						cb('시간표 파싱이 정상적으로 이루어지지 않았습니다.');
					}
				}
			});
		}, 
		cb => {
			fs.readFile(json_path, 'utf8', function(err, file_data) {
				cb(null, file_data);
			});
		},
		(file_data, cb) => {
			var parsed_obj = {};
			try {
				parsed_obj = JSON.parse(file_data);
			} catch (e) {
				return cb(e);
			}
			cb(null, parsed_obj);
		},
		(json, cb) => {
			var regular_schedule = [];
			if (!json.result) {
				return cb('이미지 프로세싱에 실패했습니다.');
			}
			var data = json.data;
			data.map(function(item) {
				var yoil = item.day;
				yoil = yoil2int(yoil);
				var times = item.time;
				var place = '-';
				var title = '정기일정';
				var contents = user_id + '의 정기 일정';
				var start_date = new Date(0);
				var end_date = new Date(0);
				times.map(function(time_str) {
					var schedule_id = 'schedule_id_' + randString(10);
					var start_time = time_str.split(' ~ ')[0];
					var end_time = time_str.split(' ~ ')[1];
					
					regular_schedule.push({
						user_id: user_id,
						schedule_id: schedule_id,
						place: place,
						title: title,
						contents: contents,
						start_date: start_date,
						end_date: end_date,
						start_time: start_time,
						end_time: end_time,
						day: yoil
					});
				});
			});
			
			db.user.findOneAndUpdate({
				user_id: user_id
			}, {
				$set: {
					regular_schedule: regular_schedule
				}
			}, function(err, data) {
				if (err) {
					cb(err);
				} else if (!data) {
					cb('없는 유저입니다.');
				} else {
					cb(null, '정상적으로 동기화가 완료되었습니다.');
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
				
				db.user.update({
					user_id: user_id
				}, {
					$addToSet: {
						regular_schedule: {
							schedule_id: schedule_id,
							place: place,
							title: title,
							contents: contents,
							start_date: str2date(start_date),
							end_date: str2date(end_date),
							start_time: start_time,
							end_time: end_time,
							day: day
						}
					}
				}, function(err) {
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

exports.getUserScheduleList = function(req, res) {
	var user_id = req.session.user_id || '';
	// 'all' | 'temporal' | 'regular'
	var type = req.query.type || '';
	
	async.waterfall([
		cb => {
			if (!user_id) cb('need session');
			else if (!type) cb('type is not specified');
			else if (type !== 'all' && type !== 'temporal' && type !== 'regular') cb('invalid type');
			else cb(null);
		},
		cb => {
			async.parallel({
				temporal: function(pcb) {
					if (type === 'all' || type === 'temporal') {
						db.temporal_schedule.find({
							user_id: user_id
						}, function(err, tmp_data) {
							if (err) {
								pcb(err);
							} else {
								async.map(tmp_data, function(item, next) {
									next(null, item.schedule_id);
								}, function(merr, mdata) {
									pcb(merr, mdata);
								});
							}
						});
					} else {
						pcb(null);
					}
				},
				regular: function(pcb) {
					if (type === 'all' || type === 'regular') {
						db.user.findOne({
							user_id: user_id
						}, {
							regular_schedule: 1
						}, function(err, user_data) {
							if (err) {
								pcb(err);
							} else {
								var reg_data = user_data.regular_schedule;
								async.map(reg_data, function(item ,next) {
									next(null, item.schedule_id);
								}, function(merr, mdata) {
									pcb(merr, mdata);
								});
							}
						});
						
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

exports.getUserSchedule = function(req, res) {
	var user_id = req.session.user_id;
	// 'all' | 'temporal' | 'regular'
	var type = req.query.type || false;
	var schedule_id = req.query.schedule_id || false;
	
	var find_query = {
		user_id: user_id
	};
	
	if (schedule_id) {
		find_query.schedule_id = schedule_id;
	}
	
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
						db.temporal_schedule.find(find_query, function(err, tmp_data) {
							pcb(err, tmp_data);
						});
					} else {
						pcb(null);
					}
				},
				regular: function(pcb) {
					if (type === 'all' || type === 'regular') {
						db.user.findOne({
							user_id: user_id
						}, {
							regular_schedule: 1
						}, function(err, user_data) {
							if (err) {
								pcb(err);
							} else {
								var reg_data = user_data.regular_schedule;
								if (schedule_id) {
									reg_data = reg_data.filter(function(item) {
										return item === schedule_id;
									});
								}
								pcb(err, reg_data);
							}
						});
						
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

exports.modifyUserSchedule = function(req, res) {
	var type = req.body.type || false;
	// 'temporal' | 'regular'
	var schedule_id = req.body.schedule_id || false;
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
			if (!type || !schedule_id) cb('insufficient parameter');
			else if (type !== 'regular' && type !== 'temporal') cb('invalid type');
			else cb(null);
		},
		cb => {
			var write_data = {};
			if (place) write_data.place = place;
			if (title) write_data.title = title;
			if (contents) write_data.contents = contents;
			if (start_date) write_data.start_date = start_date;
			if (end_date) write_data.end_date = end_date;
			
			if (type === 'regular') {
				db.user.findOne({
					'regular_schedule.schedule_id': schedule_id
				}, {
					'regular_schedule.$': 1
				}, function(err, user_data) {
					var reg_data = user_data.regular_schedule;
					if (reg_data && reg_data.length > 0) {
						var prev_data = reg_data[0];
						if (place) prev_data.place = place;
						if (title) prev_data.title = title;
						if (contents) prev_data.contents = contents;
						if (start_date) prev_data.start_date = start_date;
						if (end_date) prev_data.end_date = end_date;
						if (start_time) prev_data.start_time = start_time;
						if (end_time) prev_data.end_time = end_time;
						if (day) prev_data.day = day;
						
						db.user.update({
							'regular_schedule.schedule_id': schedule_id
						}, {
							$set: {
								'regular_schedule.$': prev_data
							}
						}, function(err) {
							cb(err, '정상적으로 정규일정이 변경되었습니다.');
						});
					} else {
						cb('유효하지 않은 정규일정입니다.');
					}
				});
			} else { // if type === 'temporal'
				db.temporal_schedule.findOneAndUpdate({
					schedule_id: schedule_id
				}, {
					$set: write_data
				}, function(err, data) {
					if (err) {
						cb(err, data);
					} else if (!data) {
						cb('유효하지 않은 스케쥴 아이디입니다.');
					} else {
						cb(null, '비정규일정이 정상적으로 변경되었습니다.');
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
	
};

exports.deleteUserSchedule = function(req, res) {
	var user_id = req.session.user_id || false;
	var type = req.body.type || false;
	var schedule_id = req.body.schedule_id || false;
	
	async.waterfall([
		cb => {
			if (!type || !schedule_id) cb('insufficient parameters');
			else if (type !== 'temporal' && type !== 'regular') cb('invalid type param');
			else if (!user_id) cb('로그인 하셔야 합니다.');
			else cb(null);
		},
		cb => {
			if (type === 'temporal') {
				db.temporal_schedule.findOne({
					schedule_id: schedule_id
				}, function(err, data) {
					if (err) cb(err);
					else if (!data) cb('유효하지 않은 비정기 스케쥴입니다.');
					else {
						db.temporal_schedule.remove({
							schedule_id: schedule_id
						}, function(err) {
							cb(err, '성공적으로 비정기 일정 삭제');
						});
					}
				});
			} else { //type === 'regular'
				db.user.update({
					user_id: user_id
				}, {
					$pull: {
						regular_schedule: {
							schedule_id: schedule_id
						}
					}
				}, function(err) {
					cb(err, '성공적으로 정기 일정을 삭제했습니다.');
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

exports.getFileList = function(req, res) {
	var team_id = req.params.team_id || false;
	
	async.waterfall([
		cb => {
			if (!team_id) {
				cb('insufficient params');
			} else {
				cb(null);
			}
		},
		cb => {
			db.file_manager.find({
				team_id: team_id
			}).sort({
				upload_time: -1
			}).exec(function(err, file_data) {
				cb(err, file_data);
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
exports.uploadAvatar = function(req, res) {
	var user_id = req.session.user_id || false;
	var file_path = __storage_path + '/avatar/' + user_id;
	
	console.log('req.file:', req.file);
	console.log('file_path:',file_path);

	async.waterfall([
		cb => {
			if (!user_id) {
				// cb(req.body);
				cb('insufficient parameters');
			} else if (typeof req.file === 'undefined') {
				cb('file is not uploaded');
			} else {
				cb(null);
			}
		},
		cb => {
			if (fs.existsSync(__storage_path + '/avatar')) {
				cb(null);
			} else {
				mkdirp(__storage_path + '/avatar', function(err) {
					cb(err);
				});
			}
		},
		cb => {
			async.parallel([
				nj => {
					var snapshot = new db.users({
						avatar_path: file_path
					});

					snapshot.save(function(err) {
						nj(err);
					});
					
				},
				nj => {
					var tmp_path = req.file.path;
					fs.rename(tmp_path, file_path, function(_err) {
						//fs.chmod(target_path, 0755);	// 755 is wrong. 0755 or '755' are correct.
						nj(_err);
					});
				}
			], function(err) {
				cb(err, '파일이 정상적으로 업로드 되었습니다.');
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

exports.uploadFile = function(req, res) {
	var team_id = req.params.team_id || false;
	var file_id = 'file_' + randString(10);
	var file_path = __storage_path + '/' + team_id + '/' + file_id;
	var file_name = req.query.file_name || false;
	var contents = req.query.contents || '';
	var uploader = req.session.user_id || false;
	var upload_time = new Date();

	async.waterfall([
		cb => {
			if (!team_id || !file_name || !uploader) {
				// cb(req.body);
				cb('insufficient parameters');
			} else if (typeof req.file === 'undefined') {
				cb('file is not uploaded');
			} else {
				cb(null);
			}
		},
		cb => {
			if (fs.existsSync(__storage_path + '/' + team_id)) {
				cb(null);
			} else {
				mkdirp(__storage_path + '/' + team_id, function(err) {
					cb(err);
				});
			}
		},
		cb => {
			async.parallel([
				nj => {
					var snapshot = new db.file_manager({
						team_id: team_id,
						file_id: file_id,
						file_path: file_path,
						file_name: file_name,
						contents: contents,
						uploader: uploader,
						upload_time: upload_time
					});

					snapshot.save(function(err) {
						nj(err);
					});
					
				},
				nj => {
					var tmp_path = req.file.path;
					fs.rename(tmp_path, file_path, function(_err) {
						//fs.chmod(target_path, 0755);	// 755 is wrong. 0755 or '755' are correct.
						nj(_err);
					});
				}
			], function(err) {
				cb(err, '파일이 정상적으로 업로드 되었습니다.');
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

exports.downloadFile = function(req, res) {
	var team_id = req.params.team_id || false;
	var file_id = req.query.file_id || false;
	var file_name = req.query.file_name || false;
	
	async.waterfall([
		cb => {
			if (!team_id || !file_id || !file_name) {
				cb('insufficient params');
			} else {
				cb(null);
			}
		},
		cb => {
			db.file_manager.findOne({
				team_id: team_id,
				file_id: file_id,
				file_name: file_name
			}, function(err, file_data) {
				if (!file_data) {
					cb('cannot find file');
				} else {
					cb(err, file_data);
				}
			});
		}
	], function(err, result) {
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.download(result.file_path, result.file_name);
		}
	});
};

exports.modifyFileMetaData = function(req, res) {
	var team_id = req.params.team_id || false;
	var file_id = req.body.file_id || false;
	var file_name = req.body.file_name || false;
	var contents = req.body.contents || false;
	var uploader = req.session.user_id || false;
	
	async.waterfall([
		cb => {
			if (!team_id || !file_id) {
				cb('insufficient params');
			} else if (!uploader) {
				cb('need session. please login');
			} else {
				cb(null);
			}
		},
		cb => {
			db.file_manager.findOne({
				team_id: team_id,
				file_id: file_id
			}, function(err, file_meta_data) {
				if (!file_meta_data) {
					cb('cannot find that file!');
				} else {
					cb(err, file_meta_data);
				}
			});
		},
		(meta_data, cb) => {
			if (meta_data.uploader !== uploader) {
				cb('only uploader can modify file meta data');
			} else {
				var change_data = {};
				if (file_name) change_data.file_name = file_name;
				if (contents) change_data.contents = contents;
				
				db.file_manager.update({
					team_id: team_id,
					file_id: file_id
				}, {
					$set: change_data
				}, function(err) {
					cb(err, 'file meta data changed successfully');
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

exports.deleteFileName = function(req, res) {
	var team_id = req.params.team_id || false;
	var file_id = req.body.file_id || false;
	
	async.waterfall([
		cb => {
			if (!team_id || !file_id) {
				cb('insufficient params');
			} else {
				cb(null);
			}
		},
		cb => {
			db.file_manager.findOne({
				file_id: file_id,
				team_id: team_id
			}, function(err, file_meta_data) {
				if (!file_meta_data) {
					cb('cannot find file');
				} else {
					cb(err, file_meta_data);
				}
			});
		},
		(meta_data, cb) => {
			var real_file_path = meta_data.file_path;
			
			fs.stat(real_file_path, function(stat_err, status) {
				if (stat_err) {
					cb(stat_err);
				} else {
					if (status.isFile()) {
						fs.unlink(real_file_path, function(unlink_err) {
							cb(unlink_err);
						});
					} else {
						console.log(real_file_path, 'is not simple file. cannot delete this');
						cb(null);
					}
				}
			});
		},
		cb => {
			db.file_manager.remove({
				file_id: file_id,
				team_id: team_id
			}, function(err) {
				cb(err, '파일이 성공적으로 삭제되었습니다.');
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

exports.getTeamInvitation = function(req, res) {
	var team_id = req.params.team_id || false;
	async.waterfall([
		cb => {
			if (!team_id) {
				cb('insufficient params');
			} else {
				cb(null);
			}
		},
		cb => {
			db.invitation.find({
				team_id: team_id
			}, function(err, invit_data) {
				cb(err, invit_data);
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

exports.inviteMember = function(req, res) {
	var team_id = req.params.team_id || false;
	var user_id = req.body.user_id || false;
	var current_user_id = req.session.user_id || false;
	var invitation_id = 'invitation_' + randString(10);
	//이미 초대장을 발송했거나 팀원인 경우 초대되지 않는 프로세스 필요.
	async.waterfall([
		cb => {
			if (!team_id || !user_id || !current_user_id) {
				cb('insufficient params');
			} else {
				cb(null);
			}
		},
		cb => {
			db.team.findOne({
				team_id: team_id
			}, function(err, team_data) {
				if (!team_data) {
					cb('cannot find team');
				} else {
					cb(err, team_data);
				}
			});
		},
		(team_data, cb) => {
			var manager_id = team_data.manager_id;
			var team_id = team_data.team_id;
			var member_id = team_data.member_id;
			
			if (manager_id !== current_user_id) {
				cb('조장만 초대할 수 있습니다.');
			} else if (member_id.indexOf(user_id) !== -1) {
				cb('이미 팀 맴버입니다.');
			} else {
				cb(null, team_id);
			}
		},
		(team_id, cb) => {
			db.user.findOne({
				user_id: user_id
			}, function(err, user_data) {
				if (!user_data) {
					cb('존재하지 않는 유저입니다.');
				} else {
					cb(null);
				}
			});
		},
		cb => {
			db.invitation.findOne({
				team_id: team_id,
				user_id: user_id,
				state: 'Pending'
			}, function(err, invit_data) {
				if (invit_data) {
					cb('이미 초대장이 발송된 유저입니다.');
				} else {
					cb(err);
				}
			});
		},
		cb => {
			var snapshot = new db.invitation({
				invitation_id: invitation_id,
				team_id: team_id,
				user_id: user_id,
				state: 'Pending'
			});
			
			snapshot.save(function(err) {
				cb(err, '성공적으로 초대되었습니다.');
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

exports.cancelInvitation = function(req, res) {
	var team_id = req.params.team_id || false;
	var invitation_id = req.body.invitation_id || false;
	var current_user_id = req.session.user_id || false;
	async.waterfall([
		cb => {
			if (!team_id || !invitation_id || !current_user_id) {
				cb('insufficient params');
			} else {
				cb(null);
			}
		},
		cb => {
			db.team.findOne({
				team_id: team_id
			}, function(err, team_data) {
				if (!team_data) {
					cb('cannot find team');
				} else {
					cb(err, team_data);
				}
			});
		},
		(team_data, cb) => {
			var manager_id = team_data.manager_id;
			var team_id = team_data.team_id;
			if (manager_id !== current_user_id) {
				cb('조장만 초대를 취소할 수 있습니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			db.invitation.findOne({
				invitation_id: invitation_id,
				state: 'Pending'
			}, function(err, invite_data) {
				if (!invite_data) {
					cb('cannot find invitation');
				} else {
					cb(err, invite_data);
				}
			});
		},
		(invite_data, cb) => {
			db.invitation.update({
				invitation_id: invitation_id,
				state: 'Pending'
			}, {
				$set: {
					state: 'Canceled'
				}
			}, function(err) {
				cb(err, '성공적으로 초대가 취소되었습니다.');
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
			});			
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
};

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
				});
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
};

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
};
				
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
};

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
};

exports.getTeamSchedule = function(req, res) {
	var team_id = req.params.team_id || false;
	var tag = req.query.tag || false;
	var team_schedule_id = req.query.team_schedule_id || false;
	
	var find_query = {
		team_id: team_id
	};
	if (tag) find_query.tag = new RegExp(tag);
	if (team_schedule_id) find_query.team_schedule_id = team_schedule_id;
	
	async.waterfall([
		cb => {
			//implement me!		
			if (!team_id) {
				cb('insufficient params');
			} else {
				cb(null);
			}
		},
		cb => {
			db.team_schedule.find(find_query, function(err, schedule_data) {
				cb(err, schedule_data);
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

exports.modifyTeamSchedule = function(req, res) {
	var team_schedule_id = req.body.team_schedule_id || false;
	var team_id = req.params.team_id || false;
	var tag = req.body.tag || false;
	var place = req.body.place || false;
	var title = req.body.title || false;
	var contents = req.body.contents || false;
	var start_date = req.body.start_date || false;
	var end_date = req.body.end_date || false;
	
	var update_query = {};
	if (tag) update_query.tag = tag;
	if (place) update_query.place = place;
	if (title) update_query.title = title;
	if (contents) update_query.contents = contents;
	if (start_date) update_query.start_date = str2date(start_date);
	if (end_date) update_query.end_date = str2date(end_date);
	
	async.waterfall([
		cb => {
			if (!team_id) {
				cb('insufficient params');
			} else {
				cb(null);
			}
		},
		cb => {
			db.team_schedule.findOneAndUpdate({
				team_schedule_id: team_schedule_id,
				team_id: team_id
			}, update_query, function(err, data) {
				if (!data) {
					cb('해당 팀 일정이 없습니다.');
				} else {
					cb(err, '팀 일정이 성공적으로 변경되었습니다.');
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

exports.addTeamSchedule = function(req, res) {
	var team_id = req.params.team_id || false;
	var team_schedule_id = 'team_schedule_' + randString(10);
	var tag = req.body.tag || '';
	var place = req.body.place || '';
	var title = req.body.title || '';
	var contents = req.body.contents || '';
	var start_date = str2date(req.body.start_date);
	var end_date = str2date(req.body.end_date);
	async.waterfall([
		cb => {
			if (!team_id || !tag || !place || !title || !contents) {
				cb('insufficient params');
			} else {
				cb(null);
			}
		},
		cb => {
			var snapshot = db.team_schedule({
				team_schedule_id: team_schedule_id,
				tag: tag, //분류용 태그
				place: place,
				title: title,
				contents: contents,
				team_id: team_id,
				start_date: start_date,
				end_date: end_date
			});
			
			snapshot.save(function(err) {
				cb(err, '일정이 성공적으로 저장되었습니다.');
			});
		}
	], function(err, result) {
		if (err) {
			res.json({
				err: err
			});
		} else {
			res.json({
				result: result,
				team_schedule_id: team_schedule_id
			});
		}
	});
};

exports.deleteTeamSchedule = function(req, res) {
	var team_id = req.params.team_id || false;
	var team_schedule_id = req.body.team_schedule_id || false;
	async.waterfall([
		cb => {
			//implement me!		
			if (!team_id || !team_schedule_id) {
				cb('insufficient params');
			} else {
				cb(null);
			}
		},
		cb => {
			db.team_schedule.findOne({
				team_id: team_id,
				team_schedule_id: team_schedule_id
			}, function(err, schedule_data) {
				if (!schedule_data) {
					cb('유효하지 않은 팀 스케쥴입니다.');
				} else {
					cb(err);
				}
			});
		},
		cb => {
			db.team_schedule.remove({
				team_id: team_id,
				team_schedule_id: team_schedule_id
			}, function(err) {
				cb(err, '성공적으로 팀 스케쥴을 삭제했습니다.');
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

exports.createTeam = function (req, res) {
	
	if (Object.keys(req.query).length) {
		req.body = req.query;		
	}
	
	var team_id = 'team_' + randString(10);
	var team_name = req.body.team_name || "";
	var manager_id = req.session.user_id || '';
	var contents = req.body.contents || "";
	var deleted = false;
	
	async.waterfall([
		cb => {
			if (!team_name) {
				cb('팀 이름을 기입해주세요.');
			} else if (!manager_id) {
				cb('로그인 하셔야 팀을 만들 수 있습니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			db.team.findOne({
				team_name: team_name
			}, function(err, result) {
				if (err) {
					return cb(err);
				}
				cb(null, result);
			});
		},
		(team_id_data, cb) => {

			if (team_id_data) {
				return cb('중복된 이름의 팀 명이 존재합니다.');
			}
			var new_team = new db.team({				
				team_id: team_id,
				team_name: team_name,
				manager_id: manager_id,
				member_id: [manager_id],
				contents: contents,
				deleted: deleted				
			});
			
			new_team.save( function(err) {
				if (err) {
					cb(err);
				} else {
					cb(null);
				}
			});
		},
		cb => {
			db.user.findOneAndUpdate({
				user_id: manager_id
			}, {
				$addToSet: {
					team_id: team_id
				}
			}, function(err, user_data) {
				if (!user_data) {
					cb('유효하지 않은 유저입니다.');
				} else {
					cb(err, '팀 생성 성공!');
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
				result: result,
				team_id: team_id
			});
		}
	});	
};
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
};

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
};

exports.deleteTeam = function (req, res){

	if (Object.keys(req.query).length) {
		req.body = req.query;		
	}
	
	var team_id = req.params.team_id || '';
	
	// invitation??, feed??
	// appointment schedule, [due date, calendar 차이]		
	
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
				if (err) {
					cb(err);
				} else {
					cb(result);
				}
			});		
		},
		cb => { // report에서 해당 팀의 정보 삭제
			db.report.remove({
				team_id: team_id
			}, function (err, result) {
				if (err) {
					cb(err);
				} else {
					cb(result);
				}
			});
		},
		cb => { // file_manager에서 해당 팀의 정보 삭제
			db.file_manager.remove({
				team_id: team_id
			}, function (err, result) {
				if (err) {
					cb(err);
				} else {
					cb(result);
				}
			});
		},
		cb => { // chat_data에서 해당 팀의 정보 삭제		
			db.chat.find({
				team_id: team_id
			}, function (err, chat_info) {				
				async.mapLimit(chat_info, 100, function (item, next) {
					db.chat_data.remove({
						message_id: item.message_id
					}, function (err, success) {
						if (err) {
							next(err);
						} else {
							next(null, success);
						}
					});
				}, function (err, success) {
					if (err) {
						console.log(err);
					} else {
						cb(err, success);
					}
				});
			});			
		},
		(result, cb) => { // chat에서 해당 팀의 정보 삭제
			db.chat.remove({
				team_id: team_id
			}, function (err, success) {
				if (err) {
					cb(err);
				} else {
					cb(null, success);
				}
			});
		},
		(result, cb) => { // user에서 team_id 삭제			
			db.team.findOne({
				team_id: team_id
			}, function (err, team_info) {
				async.mapLimit(team_info.member_id, 10, function (item, next) {
					// for each member_id
					db.user.findOne({
						user_id: team_info.member_id
					}, function (err, user) {
						// user의 team_id Array에서 해당 team_id 삭제
						if (user.includes(team_id)) { // true인 경우
							db.user.update({
								$pull: {team_id: team_id}
							}, function (err, success) {
								if (err) {
									cb(err);
								} else {
									cb(null, success);
								}
							});						
						} else { // false 인 경우
							cb(false);
						}
					});
				});
			});			
		},
		(result, cb) => { // team 정보에서 진행프로젝트 삭제			
			db.team.remove({
				team_id: team_id
			}, function(err, result) {
				if (err) {
					cb(err);
				} else {
					cb(err, result);
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
};

exports.syncPortal = function(req, res) {
	var user_id = req.session.user_id || false;
	var id = req.body.id || false;
	var pw = req.body.pw || false;
		
	var cwd = '';
	if (typeof __crawler_cwd !== 'undefined') {
		cwd = __crawler_cwd;
	} else {
		var splitted = __crawler_path.split('/');
		splitted.pop();
		cwd = splitted.join('/');
	}

	async.waterfall([
		cb => {
			if (!user_id || !id || !pw) {
				cb('정상적인 요청이 아닙니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			if (typeof __crawler_path === 'undefined') {
				cb('포털 크롤링을 사용할 수 없도록 설정되어있습니다.');
			} else {
				fs.stat(__crawler_path, function(err, stat) {
					if (err) {
						cb('크롤러 파일을 찾을 수 없습니다.');
					} else {
						if (stat && stat.isFile()) {
							cb(null);
						} else {
							cb('정상적인 크롤러 파일이 아닙니다.');
						}
					}
				});
			}
		},
		cb => {
			execFile(__crawler_path, [id, pw], {
				cwd: cwd
			}, function(err, stdout, stderr) {
				console.log('err', err);
				console.log('stdout', stdout);
				console.log('stderr', stderr);
				if (err) {
					cb(err);
				} else {
					var output = stderr;
					if (/Fail/.test(output)) {
						console.log(stdout);
						cb('크롤링에 실패했습니다. 아이디 혹은 패스워드가 틀렸거나 포털 서버상태가 좋지 않습니다.');
					} else {
						var json_data = {};
						try {
							json_data = JSON.parse(output);
						} catch (e) {
							return cb('올바른 JSON 형식이 아닙니다.');
						}
						cb(null, json_data);
					}
				}
			});
		},
		(json_data, cb) => {
			
			var regular_schedule = [];
			Object.keys(json_data).map(function(key) {
				var obj = json_data[key];
				var title = obj.name;
				var place = obj.place;
				var contents = user_id + '의 ' + title + ' 수업';
				var start_date = new Date(0);
				var end_date = new Date(0);
				var times = obj.time;
				
				times.map(function(time_string) {
					var schedule_id = 'schedule_id_' + randString(10);
					var yoil = time_string.substr(0, 1);
					var time2time = time_string.substr(1);
					var start_time = time2time.split('-')[0];
					var end_time = time2time.split('-')[1];
					yoil = yoil2int(yoil);
					
					regular_schedule.push({
						user_id: user_id,
						schedule_id: schedule_id,
						place: place,
						title: title,
						contents: contents,
						start_date: start_date,
						end_date: end_date,
						start_time: start_time,
						end_time: end_time,
						day: yoil
					});
				});				
			});
			
			db.user.findOneAndUpdate({
				user_id: user_id
			}, {
				$set: {
					regular_schedule: regular_schedule
				}
			}, function(err, data) {
				if (err) {
					cb(err);
				} else if (!data) {
					cb('없는 유저입니다.');
				} else {
					cb(null, '정상적으로 동기화가 완료되었습니다.');
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

exports.getMyInvitations = function(req, res) {
	var user_id = req.session.user_id || false;
	
	async.waterfall([
		cb => {
			if (!user_id) {
				cb('로그인 하셔야 합니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			db.invitation.aggregate([
				{
					$match: {
						user_id: user_id,
						state: 'Pending'
					}
				},
				{
				   $lookup: {
					   from: 'teams',
					   localField: 'team_id',
					   foreignField: 'team_id',
					   as: 'team_data'
				   }
				},
				{
					$project: {
						_id: 0,
						invitation_id: 1,
						team_id: 1,
						team_data: { $arrayElemAt: [ "$team_data", 0 ] },
					}
				},
				{
					$project: {
						invitation_id: 1,
						team_id: 1,
						team_name: '$team_data.team_name',
						team_contents: '$team_data.contents'
					}
				}
			], function(err, data) {
				cb(err, data);
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

exports.acceptInvitation = function(req, res) {
	var invitation_id  = req.body.invitation_id || false;
	var user_id = req.session.user_id || false;
	var team_id = '';
	async.waterfall([
		cb => {
			if (!invitation_id || !user_id) {
				cb('파라메터가 부족합니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			db.invitation.findOneAndUpdate({
				invitation_id: invitation_id,
				state: 'Pending'
			}, {
				$set: {
					state: 'Accept'
				}
			}, function(err, update_data) {
				if (!update_data) {
					cb('유효하지 않은 초대장입니다.');
				} else {
					cb(err, update_data);
				}
			});
		},
		(invit_data, cb) => {
			team_id = invit_data.team_id;
			db.team.findOneAndUpdate({
				team_id: team_id,
				deleted: false
			}, {
				$addToSet: {
					member_id: user_id
				}
			}, function(err, team_data) {
				if (!team_data) {
					cb('유효하지 않은 팀입니다.');
				} else {
					cb(err);
				}
			});
		},
		cb => {
			db.user.findOneAndUpdate({
				user_id: user_id
			}, {
				$addToSet: {
					team_id: team_id
				}
			}, function(err, user_data) {
				if (!user_data) {
					cb('유효하지 않은 유저입니다.');
				} else {
					cb(err, '성공적으로 초대를 승낙했습니다.');
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

exports.rejectInvitation = function(req, res) {
	var invitation_id  = req.body.invitation_id || false;
	var user_id = req.session.user_id || false;
	async.waterfall([
		cb => {
			if (!invitation_id || !user_id) {
				cb('파라매터가 부족합니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			db.invitation.findOneAndUpdate({
				invitation_id: invitation_id,
				state: 'Pending'
			}, {
				$set: {
					state: 'Reject'
				}
			}, function(err, invit_data) {
				if (!invit_data) {
					cb('유효하지 않은 초대장입니다.');
				} else {
					cb(err, '정상적으로 초대가 거절되었습니다.');
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

exports.getTeamList = function (req, res) {
	
	var user_id = req.session.user_id || req.body.user_id;	
	
	async.waterfall([
		cb => {
			if (!user_id) {
				cb('로그인 하셔야 합니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			db.user.findOne({
				user_id: user_id
			}, function (err, user_info) {
				if (err) {
					cb(err);
				} else {
					cb(null, user_info);
				}
			});
		},
		(user_info, cb) => {			
			async.mapLimit(user_info.team_id, 100, function (item, next) {
				db.team.findOne({
					team_id: item
				}, function (err, team_info) {
					if (err) {
						team_info.msg = "Fail loading team data";
						next(err);
					} else {
						next(null, team_info);
					}
				});
			}, function (err, team_data) {
				if (err) {
					console.log('team info loading failed');
				} else {
					// console.log(team_data);
					cb(err, team_data);
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
};

exports.getTeamMemberSchedule = function(req, res) {
	var team_id = req.params.team_id || false;
	
	async.waterfall([
		cb => {
			if (!team_id) {
				cb('잘못된 요청입니다.');				
			} else {
				cb(null);
			}
		},
		cb => {
			db.user.find({
				team_id: {
					$elemMatch: {
						$eq: team_id
					}
				}
			}, {
				user_name: 1,
				user_id: 1,
				regular_schedule: 1
			}, function(err, user_data) {
				cb(err, user_data);
			});
			// db.team.aggregate([
			// 	{
			// 		$match: {
			// 			team_id: team_id
			// 		}
			// 	},
			// 	{
			// 		$unwind: '$member_id'
			// 	},
			// 	{
			// 		$lookup: {
			// 			from: 'regular_schedules',
			// 			localField: 'member_id',
			// 			foreignField: 'user_id',
			// 			as: 'data'
						
			// 		}
			// 	},
			// 	{
			// 		$match: {
			// 			data: {
			// 				$ne: []
			// 			}
			// 		}
			// 	},
			// 	{
			// 		$unwind: '$data'
			// 	},
			// 	{
			// 		$group: {
			// 			_id: null,
			// 			sched: {
			// 				$push: "$data"
			// 			}
			// 		}
			// 	},
			// 	{
			// 		$project: {
			// 			_id: 0,
			// 			data: '$sched'
			// 		}
			// 	}
			// ], function(err, data) {
			// 	cb(err, data);
			// });
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

exports.uploadTimetable = function(req, res) {	
	var user_id = req.session.user_id || false;
	var file_path = __time_table_path + '/' + user_id;

	async.waterfall([
		cb => {
			if (!user_id) {
				cb('로그인 하셔야 합니다.');
			} else {
				cb(null);
			}
		},
		cb => {
			var tmp_path = req.file.path;
			fs.rename(tmp_path, file_path, function(_err) {
				//fs.chmod(target_path, 0755);	// 755 is wrong. 0755 or '755' are correct.
				cb(_err, '파일이 정상적으로 업로드 되었습니다.');
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
