Template.alerts.helpers({
	'alert' : function() {
		return alerts.find({'user_id' : Meteor.userId()}, {sort : {'time' : -1}}).fetch();
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
	},

	'click #clear-all' : function () {
		Meteor.call('clearAlerts', function(error, result) {
			if (error)
				console.log(error.message);
		});
	}
})