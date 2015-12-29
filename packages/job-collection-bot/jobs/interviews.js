/**
 * Created by HungNguyen on 12/25/15.
 */



function remindInterviewJob(j, cb) {
    try {
        var data = j.data;
        var emails = _.pluck(data.recruiters, 'mailTo');

        if (emails.length) {
            Email.send({
                from: data.sender,
                to: emails,
                subject: data.subject || 'interview tomorrow',
                html: data.body || 'this is a test'
            });

            var time = new moment(data.timeRange.end);
            time.add(2, 'hour');

            sJobCollections.addJobtoQueue('remindSubmitScorecardJob', data, null, time.toDate());
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
            var recruiterIds = _.pluck(data.recruiters, 'recruiterId')
                , recruiterGrouped = _.groupBy(data.recruiters, 'recruiterId');

            var submitedScoreCard = ScoreCard.find({
                'ref.appId': data.ref.appId,
                'ref.type': data.ref.type,
                'ref.recruiterId': {
                    $in: recruiterIds
                }
            }).map(function (item) {
                return item.ref.recruiterId;
            });

            const app = Application.findOne({appId: data.ref.appId});
            if(app) {
                const stage = Success.APPLICATION_STAGES[app.stage];
                var notSubmitScoreCard = _.difference(recruiterIds, submitedScoreCard);

                notSubmitScoreCard.forEach(function (recruiterId) {
                    const recruiter = Meteor.users.findOne({_id: recruiterId});
                    if(!recruiter) return;

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
                        subject: data.subject || 'submit scorecard please tomorrow',
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
