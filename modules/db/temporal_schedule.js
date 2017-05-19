var mongoose = require('mongoose');

//개인의 일시적인 일정
var schema = mongoose.Schema({
	user_id: String,
	schedule_id: String,
	title: String,
	contents: String,
	start_date: Date,
	end_date: Date
});

var temporal_schedule = mongoose.model('temporal_schedule', schema);

module.exports = temporal_schedule;