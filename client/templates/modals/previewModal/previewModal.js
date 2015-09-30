Template.previewModal.helpers({
	'itemId' : function() {
		if (Session.get('selectedAuction')) {
			var auction_object = auctions.findOne(Session.get('selectedAuction'));
			return auction_object.item_id;
		}

		else return "";
	},

	'auctionData' : function() {
		var auction_object = auctions.findOne(Session.get('selectedAuction'));
		if (!!auction_object) {
			return {
				'title' : auction_object.title,
				'artist' : auction_object.artist,
			}
		}

		else return {
			'title' : "",
			'artist' : "",
		}
	},

	'imageInfo' : function(item_id) {
		try {
			var item_object = items.findOne(item_id);
			var artwork_object = artworks.findOne(item_object.artwork_id);
			var auction_object = auctions.findOne(Session.get('selectedAuction')); 
			var biddable = (item_object.owner != Meteor.userId()) && (auction_object.bid_minimum <= Meteor.user().profile.bank_balance);

			var max_dimension = 400;

			var width = artwork_object.width;
			var height = artwork_object.height;
			var ratio = width / height;

			var info_object = {
				'image_width' : 0,
				'image_height' : 0,
				'biddable' : biddable,
				'imageURL' : artwork_object.img_link == "" ? "http://go-grafix.com/data/wallpapers/35/painting-626297-1920x1080-hq-dsk-wallpapers.jpg" : artwork_object.img_link
			};

			if (width > height) {
				info_object.image_width = max_dimension;
				info_object.image_height = Math.floor(max_dimension / ratio);
			}

			else {
				info_object.image_height = max_dimension;
				info_object.image_width = Math.floor(max_dimension * ratio);
			}

			return info_object;
		}

		catch(error) {
			console.log(error.message);
			return {
				'image_width' : 0,
				'image_height' : 0,
				'biddable' : false,
				'filename' : ""
			};
		}
	},
})

Template.previewModal.events({
	'click #close-button' : function() {
		Modal.hide('previewModal');
	},

	'click #place-bid' : function() {
		Modal.hide('previewModal');

		setTimeout(function() {
			Modal.show('placeBidModal');
		}, 500);
	}
})