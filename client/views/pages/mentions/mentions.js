const tmplUser = Template['Mention.User'];
const tmplHashTag = Template['Mention.HashTag'];

tmplUser.helpers({
	MentionUser() {
		return MentionUser;
	}
});

tmplHashTag.helpers({
	MentionHashTagContainer() {
		return MentionHashTagContainer;
	}
});