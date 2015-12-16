/**
 * Created by HungNguyen on 11/18/15.
 */

function formatDatetimeFromVNW(datetime) {
    var d = moment(datetime);
    var offsetBase = 420;
    var offsetServer = new Date().getTimezoneOffset();
    var subtract = offsetBase + offsetServer;
    d.subtract(subtract, 'minute');
    return d.toDate();
}

var VNW_QUERIES = Meteor.settings.cronQueries;

var fetchVNWData = Meteor.wrapAsync(function (query, callback) {
    var conn = mysqlManager.getPoolConnection();

    conn.query(query, function (err, rows, fields) {
        if (err) throw err;
        conn.release();
        callback(err, rows);
    });
});

var getApplicationByJobId = function (job, cb) {
    var JobExtraCollection = JobExtra.getCollection()
        , appCollection = Application.getCollection()
        , data = job.data
        , jobId = data.jobId
        , count = 0;

    if (!data.jobId || !data.companyId)
        job.done();
    else {
        var appSql = '', appRows = [];
        try {
            if (data.isUpdate) {
                var options = {
                    sort: {
                        appId: -1
                    }
                };
                var lastAppOnline = appCollection.findOne({jobId: jobId, type: 1}, options) || {appId: 0}
                    , lastAppDirect = appCollection.findOne({jobId: jobId, type: 2}, options) || {appId: 0};

                appSql = sprintf(VNW_QUERIES.getNewApplications, jobId, lastAppOnline.appId, jobId, lastAppDirect.appId);

            } else
                appSql = sprintf(VNW_QUERIES.getApplicationByJobId, jobId, jobId);

            appRows = fetchVNWData(appSql);

            appRows.forEach(function (info) {
                var application = appCollection.findOne({appId: info.appId});
                if (!application) {
                    application = new Application();
                    application.set('appId', info.appId);
                    application.set('type', info.appType);
                    application.set('jobId', info.jobId);
                    application.set('candidateId', info.candidateId);
                    application.set('companyId', data.companyId);
                    application.set('matchingScore', info.score);
                    application.set('coverLetter', info.coverLetter);
                    application.set('firstname', info.firstname);
                    application.set('lastname', info.lastname);
                    application.set('genderId', info.genderId);
                    application.set('dob', info.birthday);
                    application.set('countryId', info.countryId);
                    application.set('phone', info.homephone);
                    application.set('mobile', info.cellphone);

                    info.jobTitle && application.set('jobTitle', info.jobTitle);
                    const city = Meteor.cities.findOne({vnwId: info.cityId, languageId: 2});
                    if (city)
                        application.set('cityName', city.name);

                    var emails = _.unique((info.emails) ? info.emails.split('|') : []);

                    application.set('emails', emails);
                    application.set('appliedDate', formatDatetimeFromVNW(info.appliedDate));
                    count++;
                }

                application.set('isDeleted', !!(info.isDeleted)); // the only field update

                application.save();

            });

            /*var stages = {
             'sourced': 0,
             'applied': 0,
             'phone': 0,
             'interview': 0,
             'offer': 0,
             'hired': 0
             };

             appCollection.find({jobId: jobId}, {fields: {'stage': 1}}).map(function (app) {
             switch (app.stage) {
             case 0:
             stages['sourced']++;
             break;
             case 1:
             stages['applied']++;
             break;
             case 2:
             stages['phone']++;
             break;
             case 3:
             stages['interview']++;
             break;
             case 4:
             stages['offer']++;
             break;
             case 5:
             stages['hired']++;
             break;
             default :
             break;
             }
             });*/


            var currentJob = JobExtraCollection.findOne({jobId: jobId});

            if (currentJob) {
                //TODO : this is workaround for missing handle blacklist features.
                currentJob.set('stage.applied', (data.isUpdate) ? currentJob.stage.applied + count : appRows.length);

                currentJob.set('syncState', 'synced');
                currentJob.save();
            }

            job.done();

        } catch (e) {
            console.log('insert application error :', data);

            if (jobId) {
                var failedJob = JobExtraCollection.findOne({jobId: jobId});
                failedJob.set('syncState', 'syncFailed');
                failedJob.save();
            }
            console.trace(e);
            job.fail('sync failed');
        }
    }
    cb();


};

Collections.SyncQueue.processJobs('getApplications', {concurrency: 20, payload: 1}, getApplicationByJobId);