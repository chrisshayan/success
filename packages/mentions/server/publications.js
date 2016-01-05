Meteor.publishComposite('Mentions.Hashtag', function (selector, options) {
	check(selector, Object);
	check(options, Object);

	return {
		find() {
			if(options['limit']) options['limit'] += 1;
			else options['limit'] = 11;
			return Mention.find(selector, options);
		},

		children: [
			// Publish ref data
			{
				find(mention) {
					return mention ? Meteor.users.find({_id: mention.createdBy}) : null;
				}
			},

			{
				find(mention) {
					return mention && mention.ref['jobId'] ? JobExtra.find({jobId: mention.ref['jobId']}) : null;
				}
			}
		]
	}
});