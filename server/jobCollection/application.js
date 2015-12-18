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
        try {
            var currentJob = JobExtraCollection.findOne({jobId: jobId});

            if (currentJob) {

                var appOnline = [{appId: 0}]
                    , appDirect = [{appId: 0}];


                appCollection.find({jobId: jobId}).fetch().forEach(function (app) {
                    if (app.type === 1)
                        appOnline.push(app);
                    else
                        appDirect.push(app);
                });

                //    appSql = sprintf(VNW_QUERIES.getApplicationByJobId, jobId, jobId);

                var appSql = sprintf(VNW_QUERIES.getNewApplications, jobId, _.pluck(appOnline, 'appId'), jobId, _.pluck(appDirect, 'appId'));

                var appRows = fetchVNWData(appSql);

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


                currentJob.resetStages();
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