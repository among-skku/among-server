var mongoose = require('mongoose');

var schema = mongoose.Schema({
	user_id: String,
	user_name: String,
	password: String,
	email: String,
	phone: String,
	// regular_schedule: [Object],
	regular_schedule: [mongoose.Schema({
		user_id: String,
		schedule_id: String,
		place: String,
		title: String,
		contents: String,
		start_date: Date, //기간
		end_date: Date,
		start_time: String, //시각 12:33 와 같은 포맷
		end_time: String,
		day: String //요일
	}, {_id: false})],
	temporal_schedule: [Object],
	team_id: [String],
	avatar_path: String,
	timetable_path: String
});

var user = mongoose.model('user', schema);

module.exports = user;