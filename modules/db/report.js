var mongoose = require('mongoose');

var schema = mongoose.Schema({
	report_id: String,
	team_id: String,
	title: String,
	contents: String,
	attendee: [String],
	writer_id: String,
	create_time: Date,
	update_time: Date
});

var report = mongoose.model('report', schema);

module.exports = report;