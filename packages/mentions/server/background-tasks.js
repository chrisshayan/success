const options = {
	concurrency: 5
};

function notifyMention(j, cb) {
	const data = j.data;

	try {
		if (data.mentionType === Mention.MENTION_TYPE.USER) {
			const mention = Mention.findOne({_id: data._id});
			const activity  = Activities.findOne({_id: data.typeId});
			const creator   = Meteor.users.findOne({_id: data.createdBy});
			const recruiter = Meteor.users.findOne({username: data.text});

			if (activity && recruiter) {
				const app = Application.findOne({appId: activity.ref.appId});
				const job = JobExtra.findOne({jobId: activity.ref.jobId});
				if (app && job) {
					// prepare mail template
					const stage = Success.APPLICATION_STAGES[app.stage];
					SSR.compileTemplate('NotifyMention', Assets.getText('private/notify-mention.html'));
					var jobUrl  = Meteor.absoluteUrl(`job/${app.jobId}/${stage.alias}?appId=${app.appId}&appType=${app.type}`);
					var pictureUrl = '';
					if(creator['profile'] && creator['profile']['avatar']) {
						pictureUrl = creator['profile']['avatar'];
					}

					var activityContent = mention.embed || '';
					activityContent = activityContent
						.replace(/(\B@\w+)/g, '<span class="mention people">$1</span>')
						.replace(/(\B#\w+)/g, '<span class="mention hash">$1</span>')
						.replace(/(\n|\r\n)/g, '<br/>');

					var html    = SSR.render("NotifyMention", {
						recruiter: recruiter.fullname() || recruiter.username,
						creator: creator.fullname() || creator.username,
						pictureUrl: pictureUrl,
						position : job.jobTitle,
						candidate: app.fullname,
						// activity info
						time: moment(activity.createdAt).format('llll'),
						content: activityContent,
						jobUrl   : jobUrl,
					});

					Email.send({
						from   : 'no-reply@success.vietnamworks.com',
						to     : recruiter.defaultEmail(),
						subject: `Notification from ${job.jobTitle}`,
						html   : html
					});
				}
			}
		}

		j.done();
	} catch (e) {
		console.trace(e);
		j.fail('cannot notify mention');
	}
	cb();
}

sJobCollections.registerJobs('notifyMention', notifyMention, options);