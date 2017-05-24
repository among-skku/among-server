var mongoose = require('mongoose');

var schema = mongoose.Schema({
	invitation_id: String,
	team_id: String,
	user_id: String,
	state: String //Accept, Reject, Pending, Canceled 중 한 개
});

var invitation = mongoose.model('invitation', schema);

module.exports = invitation;