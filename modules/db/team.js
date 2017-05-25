var mongoose = require('mongoose');

var schema = mongoose.Schema({
	team_id: String,
	team_name: String,
	manager_id: String,
	member_id: [String],
	contents: String,
	deleted: Boolean
});

var team = mongoose.model('team', schema);

module.exports = team;