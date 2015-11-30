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


function processCandidates(candidateId) {
    if (!candidateId) return false;
    var getCandidatesSQL = sprintf(VNW_QUERIES.getCandiatesInfo, candidateId);
    var candidateRows = fetchVNWData(getCandidatesSQL);

    candidateRows.forEach(function (row) {
        //var candidate = Collections.Candidates.findOne({candidateId: row.userid});
        var candidate = new Candidate();

        //console.log('new candidate: ', row.userid);
        //console.log('new', row.userid, row.firstname);
        //candidate = new Schemas.Candidate();
        candidate.candidateId = row.userid;
        candidate.username = row.username;
        candidate.password = row.password;
        candidate.firstname = row.firstname;
        candidate.lastname = row.lastname;
        candidate.jobTitle = row.jobTitle;
        candidate.workingCompany = row.workingCompany;
        candidate.vnwData = row;
        candidate.data = row;
        candidate.createdAt = formatDatetimeFromVNW(row.createddate);
        candidate.updatedAt = formatDatetimeFromVNW(row.lastdateupdated);

        //Collections.Candidates.insert(candidate);
        if (!candidate.isExist()) {
            candidate.save();
        } else {
            candidate.updateCandidate();


            /*//TODO : in the future, the 3rd job will care this one
             if (!_.isEqual(candidate.data, row)) {
             Collections.Jobs.update(candidate._id, {
             $set: {
             data: row,
             lastSyncedAt: new Date()
             }
             });
             }*/
        }
    })
}

function processUpdateApplication() {
}


function processApplication(data, info) {
    var application = Application.findOne({appId: data.appId});

    if (!application) {
        if (!info) return null;

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

    var isDeleted = (info) ? !!(info.isDeleted) : !application.isDeleted;

    application.set('isDeleted', isDeleted); // the only field update

    return application;

}

var Applications = {
        addApplications: function (jc, cb) {
            try {
                var data = jc.data; // appId, companyId, source, jobId

                console.log('start insert Application : ', data);

                var appSql = sprintf(VNW_QUERIES.getApplicationByAppId, data.appId, data.appId);
                appSql.forEach(function (app) {
                    let application = processApplication(app, data.companyId);
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