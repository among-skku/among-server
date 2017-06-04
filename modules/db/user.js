var mongoose = require('mongoose');

var schema = mongoose.Schema({
	user_id: String,
	user_name: String,
	password: String,
	email: String,
	phone: String,
	regular_schedule: [Object],
	temporal_schedule: [Object],
	team_id: [String],
	avatar_path: String,
	timetable_path: String
});

var user = mongoose.model('user', schema);

module.exports = user;