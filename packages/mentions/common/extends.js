/**
 * parse and save mentions from text
 * @param companyId
 * @param jobId
 * @param type
 * @param typeId
 * @param text
 * @param createdBy
 */
Mention.generateMentions = function (ref, type, typeId, text, createdBy) {
	var usernames = text.match(/\B(@[\w\d\.]+)/g);
	var hashtags = text.match(/\B#\w+/g);

	// insert mention user
	_.each(_.unique(usernames), function (username) {
		username = username.replace(/[\@\s]/, '');
		const _user = Meteor.users.findOne({username: username});
		if (_user) {
			let mention = Mention.findOne({
				ref:         ref,
				mentionType: Mention.MENTION_TYPE.USER,
				type:        type,
				typeId:      typeId,
				text:        username,
				createdBy:   createdBy
			});
			if(!mention) {
				new Mention({
					ref:         ref,
					mentionType: Mention.MENTION_TYPE.USER,
					type:        type,
					typeId:      typeId,
					text:        username,
					embed:       text,
					createdBy:   createdBy
				}).save();
			}
		}
	});

	// insert mention hashtag
	_.each(_.unique(hashtags), function (tag) {
		tag = tag.replace(/[\#\s]/, '');
		let mention = Mention.findOne({
			ref:         ref,
			mentionType: Mention.MENTION_TYPE.HASHTAG,
			type:        type,
			typeId:      typeId,
			text:        tag,
			embed:       text
		});
		if (!mention) {
			new Mention({
				ref:         ref,
				mentionType: Mention.MENTION_TYPE.HASHTAG,
				type:        type,
				typeId:      typeId,
				text:        tag,
				embed:       text,
				createdBy:   createdBy
			}).save();
		}
	});
};