const methods = {};


methods['Mentions.hashtag'] = function (hashtag = '', limit = 10) {
	check(hashtag, String);

	const selector = {
		mentionType: Mention.MENTION_TYPE.HASHTAG,
		text:        hashtag
	};
	const options = {
		limit: limit,
		sort:  {
			createdAt: -1
		}
	};

	return Mention.find(selector, options).fetch();
};

Meteor.methods(methods);