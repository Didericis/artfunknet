Template.userGallery.helpers({
	'displayed': function(screen_name) {
		Meteor.call('getUserGallery', screen_name, function(error, result) {
			if (error)
				console.log(error.message);

			else Session.set('user_gallery', result);
		});

		if (Session.get('user_gallery'))
			return Session.get('user_gallery');

		else return [];
	},

	'time_remaining': function(item_id) {
		var item_object = items.findOne(item_id);

		if (item_object && item_object.status == 'displayed') {
			var expiration = moment(item_object.display_details.end);
			var now = moment(Session.get('now'));
			var remaining = expiration - now;

			var remaining_text = remaining > 0 ? getCountdownString(remaining) : "expired";
			return remaining_text;
		}

		else return "";
	},

	'entryInfo' : function(screen_name) {
		var gallery_object = galleries.findOne({'owner': screen_name});

		if (Meteor.user() && gallery_object) {
			var viewer_object = Meteor.user();
			var tickets_maxed = viewer_object.profile.tickets != undefined && Object.keys(viewer_object.profile.tickets).length >= viewer_object.profile.ticket_cap;
			var insufficient_funds = gallery_object.entry_fee > viewer_object.profile.bank_balance;

			return {
				'paid' : viewer_object.profile.screen_name == screen_name || (viewer_object.profile.tickets != undefined && viewer_object.profile.tickets[gallery_object.owner_id] != undefined),
				'pay_fee_enabled' : !insufficient_funds && !tickets_maxed,
				'entry_fee_text' : "$" + getCommaSeparatedValue(gallery_object.entry_fee),
				'screen_name' : screen_name,
				'owner_id' : gallery_object.owner_id
			}
		}

		else return {};
	},

	'npc' : function(owner_id) {
		var primary_attributes = attributes.find({'type' : "primary"}).fetch();
		var primary_ids = [];
		primary_attributes.forEach(function(db_object) {
			primary_ids.push(db_object._id);
		});

		return npcs.find({'owner_id' : owner_id, 'attribute_id' : {$in : primary_ids}});
	},

	'unmet' : function(npc_id) {
		return npcs.findOne(npc_id).players_met.indexOf(Meteor.userId()) == -1;
	}
})

Template.userGallery.events ({
	'click #enter-button' : function(element) {
		var owner_id = element.target.dataset.owner_id;
		Meteor.call('purchaseTicket', Meteor.userId(), owner_id, function(error) {
			if (error)
				console.log(error.message);
		})
	},

	'click .npc.enabled' : function(element) {
		var npc_id = element.target.dataset.npc_id;
		if (npcs.findOne(npc_id).players_met.indexOf(Meteor.userId()) == -1) {
			Meteor.call('interactWithNPC', npc_id, function(error, interaction_object) {
				if (error)
					console.log(error.message);

				else {
					Session.set('npc_interaction', interaction_object);
					Modal.show("standardNPCMessageModal");
				}
			})
		}
	},

	'mouseover .npc' : function(element) {
		var npc_id = element.target.dataset.npc_id;

		var npc_object = npcs.findOne(npc_id);
		var attribute_object = attributes.findOne(npc_object.attribute_id);
		var quality_string = npc_object.quality[0].toUpperCase() + npc_object.quality.substr(1);
		var hover_string = quality_string + " " + attribute_object.npc_name;

		if (npc_object.players_met.indexOf(Meteor.userId()) != -1)
			hover_string += " (already met)";

		setFootnote(hover_string, Math.floor(Math.random() * 1000));
	}
})

Template.userGallery.created = function() {
	this.handle = Meteor.setInterval((function() {
		var now = moment();
		Session.set('now', now.toISOString());
	}), 1000);
}

Template.userGallery.destroyed = function() {
	Meteor.clearInterval(this.handle);
}