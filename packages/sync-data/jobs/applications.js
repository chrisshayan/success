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
        var candidate = Collections.Candidates.findOne({candidateId: row.userid});
        if (!candidate) {
            //console.log('new candidate: ', row.userid);
            //console.log('new', row.userid, row.firstname);
            candidate = new Schemas.Candidate();
            candidate.candidateId = row.userid;
            candidate.data = row;
            candidate.createdAt = formatDatetimeFromVNW(row.createddate);
            Collections.Candidates.insert(candidate);


        } else {
            //TODO : in the future, the 3rd job will care this one
            if (!_.isEqual(candidate.data, row)) {
                Collections.Jobs.update(candidate._id, {
                    $set: {
                        data: row,
                        lastSyncedAt: new Date()
                    }
                });
            }
        }
    })
}

function processupdateApplication() {
}


function processApplication(row, companyId, sourceId) {
    var appId = row.entryid || row.sdid;

    var application = new Schemas.Application();
    application.entryId = +appId;
    application.companyId = +companyId;
    application.jobId = +row.jobid;
    application.candidateId = +row.userid;
    application.source = +sourceId;
    application.isDeleted = row['deleted_by_employer'];
    application.data = row;
    application.createdAt = formatDatetimeFromVNW(row.createddate);
    application.matchingScore = row.matchingScore;


    var can = Collections.Candidates.findOne({candidateId: row.userid});

    if (can) {
        var candidateInfo = {
            "firstName": can.data.firstname || can.data.firstName || '',
            "lastName": can.data.lastname || can.data.lastName || '',
            "emails": [
                can.data.username, can.data.email, can.data.email1, can.data.email2
            ]
        };

        candidateInfo.fullname = [candidateInfo.lastName, candidateInfo.firstName].join(' ');
        candidateInfo.emails = _.without(candidateInfo.emails, null, undefined, '');

        application.candidateInfo = candidateInfo;
    }
    //console.log('insert application:', application.entryId);

    if (sourceId == '1')
        application.resumeId = row.resumeid;


    return application;

}

var Applications = {
    addApplications: function (jc, cb) {
        try {
            var data = jc.data; // entryId, companyId, source

            console.log('start insert Application : ', data);

            if (data.jobId) {

                var mongoJob = Collections.Jobs.findOne({jobId: data.jobId});

                var mongoApp = Collections.Applications.findOne({entryId: data.entryId});

                if (mongoJob && !mongoApp) {

                    var getApplicationQuery = (data.source == 1 )
                        ? sprintf(VNW_QUERIES.pullAppOnline, data.entryId)
                        : sprintf(VNW_QUERIES.pullAppDirect, data.entryId);

                    var cApps = fetchVNWData(getApplicationQuery);

                    cApps.forEach(function (row) {
                        processCandidates(row.userid);
                        var application = processApplication(row, mongoJob.companyId, data.source);
                        var query = {entryId: application.entryId};
                        Collections.Applications.upsert(query, application);


                        (data.source == 1) && Meteor.defer(function () {
                            CRON_VNW.cronResume([application.resumeId]);
                        });

                        /* Log activity */
                        Meteor.defer(function () {
                            // Log applied activity
                            var activity = new Activity();
                            activity.companyId = mongoJob.companyId;
                            activity.data = {
                                applicationId: data.entryId,
                                source: data.source,
                                userId: row.userid
                            };

                            activity.createdAt = formatDatetimeFromVNW(row.createddate);
                            activity.appliedJob();

                        });

                    });
                }
            }

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
            var data = jc.data; // entryId, companyId, source
            console.log('start update Application: ', data);
            if (data.jobId) {

                var mongoJob = Collections.Jobs.findOne({jobId: data.jobId});

                var mongoApp = Collections.Applications.findOne({entryId: data.entryId});

                if (mongoJob) {

                    if (!mongoApp) {
                        sJobCollections.addJobtoQueue('addApplication', data);
                    } else {

                        var getApplicationQuery = (data.source == 1 )
                            ? sprintf(VNW_QUERIES.pullAppOnline, data.entryId)
                            : sprintf(VNW_QUERIES.pullAppDirect, data.entryId);

                        var cApps = fetchVNWData(getApplicationQuery);

                        cApps.forEach(function (row) {
                            var application = processApplication(row, mongoJob.companyId, data.source);

                            var query = {entryId: application.entryId};
                            Collections.Applications.upsert(query, application);

                            /* Log activity */
                            Meteor.defer(function () {
                                // Log applied activity
                                var activity = new Activity();
                                activity.companyId = mongoJob.companyId;
                                activity.data = {
                                    applicationId: data.entryId,
                                    source: data.source,
                                    userId: row.userid
                                };

                                activity.createdAt = formatDatetimeFromVNW(row.createddate);
                                activity.appliedJob();

                            });

                        });
                    }
                }
            }

            jc.done();
            cb();
        } catch (e) {
            jc.fail();
            cb();
            throw e;
        }


    }
};

sJobCollections.registerJobs('addApplication', Applications.addApplications);
sJobCollections.registerJobs('updateApplication', Applications.updateApplications);