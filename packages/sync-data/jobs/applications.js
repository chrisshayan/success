/**
 * Created by HungNguyen on 10/1/15.
 */


var _ = lodash;

function formatDatetimeFromVNW(datetime) {
    var d = moment(datetime);
    var offsetBase = 420;
    var offsetServer = new Date().getTimezoneOffset();
    var subtract = offsetBase + offsetServer;
    d.subtract(subtract, 'minute');
    return d.toDate();
}

function formatDatetimeToVNW(datetime) {
    var d = moment(datetime);
    var offsetBase = -420;
    var offsetServer = new Date().getTimezoneOffset();
    var subtract = offsetBase + offsetServer;
    d.subtract(subtract, 'minute');
    return d.toDate();
}

function parseTimeToString(date) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
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


function processApplication(info, data) {
    var application = Application.findOne({appId: info.appId});
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

        info.jobTitle && application.set('jobTitle', info.jobTitle);
        const city = Meteor.cities.findOne({vnwId: info.cityId, languageId: 2});
        if (city)
            application.set('cityName', city.name);

        var emails = _.unique((info.emails) ? info.emails.split('|') : []);

        application.set('emails', emails);
        application.set('appliedDate', info.appliedDate);
    }

    application.set('isDeleted', info.isDeleted); // the only field update

    return application;

}

var Applications = {
        addApplications: function (jc, cb) {
            try {
                var data = jc.data; // appId, companyId, source, jobId

                console.log('start insert Application : ', data);

                var appSql = sprintf(VNW_QUERIES.getApplicationByAppId, data.appId, data.appId);
                var rows = fetchVNWData(appSql);
                rows.forEach(function (app) {
                    let application = processApplication(app, data);
                    application && application.save();
                });

                console.log('end add application');
                jc.done();
                cb();

            } catch (e) {
                jc.fail();
                cb();
                throw e;
            }

        },

        updateApplications: function (jc, cb) {
            try {
                var data = jc.data; // app, companyId, source
                console.log('start update Application: ', data);

                let application = processApplication(data);
                application && application.save();

                jc.done();
                cb();
            } catch (e) {
                jc.fail();
                cb();
                throw e;
            }


        }
    }
    ;

sJobCollections.registerJobs('addApplication', Applications.addApplications);
sJobCollections.registerJobs('updateApplication', Applications.updateApplications);