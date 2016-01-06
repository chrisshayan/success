/**
 * Created by HungNguyen on 12/25/15.
 */



function remindInterviewJob(j, cb) {
    try {
        var data = j.data;
        var emails = _.pluck(data.recruiters, 'mailTo');

        if (emails.length) {
            const app = Application.findOne({appId: data.ref.appId, type: data.ref.type});
            const jobExtra = JobExtra.findOne({jobId: data.ref.jobId});

            if(app && jobExtra) {
                const stage = Success.APPLICATION_STAGES[app.stage];
                SSR.compileTemplate('InterviewReminder', Assets.getText('private/interview-remind.html'));

                var profileUrl = Meteor.absoluteUrl(`job/${app.jobId}/${stage.alias}?appId=${app.appId}&appType=${app.type}`);
                profileUrl += `&utm_source=notification&utm_medium=email&utm_campaign=${jobExtra.jobTitle}`;

                const start = moment(data.timeRange.start);
                const end = moment(data.timeRange.end);

                var html = SSR.render("InterviewReminder", {
                    position: jobExtra.jobTitle,
                    candidate: app.fullname,
                    profileUrl: profileUrl,
                    location: data.location,
                    time: start.format('MMMM Do YYYY, h:mma') + ' - ' + end.format('h:mma')
                });


                Email.send({
                    from: data.sender,
                    to: emails,
                    subject: data.subject || 'You have an interview tomorrow',
                    html: html
                });


                // Setup submit scorecard reminder
                var time = new moment(data.timeRange.end);
                time.add(2, 'hour');

                sJobCollections.addJobtoQueue('remindSubmitScorecardJob', data, null, time.toDate());
            }
        }

        j.done();
        cb();
    } catch (e) {
        j.fail(e);
        console.trace(e);
        cb()
    }
}


function remindSubmitScorecardJob(j, cb) {
    try {
        var data = j.data;

        if (data.recruiters) {
            var recruiterIds = _.pluck(data.recruiters, '_id')
                , recruiterGrouped = _.groupBy(data.recruiters, '_id');

            var submittedScoreCard = ScoreCard.find({
                'ref.appId': data.ref.appId,
                'ref.type': data.ref.type,
                'ref.recruiterId': {
                    $in: recruiterIds
                }
            }).map(function (item) {
                return item.ref.recruiterId;
            });

            const app = Application.findOne({appId: data.ref.appId, type: data.ref.type});

            if (app) {
                const stage = Success.APPLICATION_STAGES[app.stage];
                var notSubmitScoreCard = _.difference(recruiterIds, submittedScoreCard);
                //console.log('notSubmitScoreCard', notSubmitScoreCard);
                notSubmitScoreCard.forEach(function (recruiterId) {
                    const recruiter = Meteor.users.findOne({_id: recruiterId});
                    if (!recruiter) return;

                    SSR.compileTemplate('ScorecardReminder', Assets.getText('private/scorecard-remind.html'));

                    var scoreUrl = Meteor.absoluteUrl(`job/${app.jobId}/${stage.alias}?appId=${app.appId}&appType=${app.type}`);
                    var html = SSR.render("ScorecardReminder", {
                        recruiter: recruiter.fullname(),
                        candidate: app.fullname,
                        scoreUrl: scoreUrl
                    });

                    Email.send({
                        from: data.sender,
                        to: recruiterGrouped[recruiterId][0].mailTo,
                        subject: data.subject || 'Submit scorecard after interview',
                        html: html
                    });
                });
            }
        }

        j.done();
        cb();
    } catch (e) {
        console.trace(e);
        j.fail(e);
        cb(e);
    }
}


sJobCollections.registerJobs('remindInterviewJob', remindInterviewJob);
sJobCollections.registerJobs('remindSubmitScorecardJob', remindSubmitScorecardJob);


/*
 SyncedCron.options = {
 log: false,
 collectionName: 'remindBot',
 utc: false,
 collectionTTL: 172800
 };

 var startRemindBot = function () {

 SyncedCron.add({
 name: 'Check interview and setup reminder',
 schedule: function (parser) {
 return parser.text('at 12:00 AM');
 },
 job: function () {

 }
 });
 SyncedCron.add({
 name: 'Check scorecard status and setup reminder',
 schedule: function (parser) {
 return parser.text('at 12:00 AM');
 },
 job: function () {

 }
 });
 };


 Meteor.startup(function () {
 //startRemindBot();
 });*/
