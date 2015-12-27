/**
 * Created by HungNguyen on 12/25/15.
 */



function remindInterviewJob(j, cb) {

}


function remindSubmitScorecardJob(j, cb) {

}


sJobCollections.registerJobs('remindSubmitScorecardJob', remindSubmitScorecardJob);
sJobCollections.registerJobs('remindInterviewJob', remindInterviewJob);


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
            return parser.text('at 12:00 PM');
        },
        job: function () {
        }
    });
};


Meteor.startup(function () {
    //startRemindBot();
});