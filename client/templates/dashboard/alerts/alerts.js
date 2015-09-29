Template.alerts.helpers({
	'alert' : function() {
		return alerts.find({'user_id' : Meteor.userId()}).fetch();
	},

	'timestamp' : function(alert_object) {
		return getTimeString(alert_object.time);
		//return "test";
	}
})

Template.alerts.events({
	'click .dismiss-alert' : function(element) {
		var alert_id = $(element.target).closest('tr').data('alert_id');
		alerts.remove(alert_id);
	}
})