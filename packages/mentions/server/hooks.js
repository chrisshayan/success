MentionCollection.after.insert(function(userId, mention) {
	Meteor.defer(() => {
		if(mention.mentionType === Mention.MENTION_TYPE.USER) {
			sJobCollections.addJobtoQueue('notifyMention', mention);
		}
	});
});