var mongoose = require('mongoose');

var schema = mongoose.Schema({
	team_schedule_id: String,
	tag: String, //분류용 태그
	place: String,
	title: String,
	contents: String,
	team_id: String,
	start_date: Date,
	end_date: Date
});

var team_schedule = mongoose.model('team_schedule', schema);

module.exports = team_schedule;