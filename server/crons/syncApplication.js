/**
 * Created by HungNguyen on 7/24/15.
 */

var VNW_TABLES = Meteor.settings.tables,
    VNW_QUERIES = Meteor.settings.queries;
var getPoolConnection = Meteor.wrapAsync(function (callback) {
    pool.getConnection(function (err, connection) {
        callback(err, connection);
    });
});

var fetchVNWData = Meteor.wrapAsync(function (connection, query, callback) {
    connection.query(query, function (err, rows, fields) {
        if (err) throw err;
        callback(err, rows);
    });
});

var queueApplication = new PowerQueue({
    isPaused: true
});

queueApplication.onStart = function () {
    //console.log('application queue done!');
};

queueApplication.onEnded = function () {
  //  console.log('application queue done!');
};


SYNC_VNW.syncApplication = function (jobIds, companyId) {
    //console.log('startSync application');
    check(jobIds, Number);
    check(companyId, Number);

    var candidates = [];
    var entryIds = [];

    //PULL Application that sent online
    var pullResumeOnlineSql = sprintf(VNW_QUERIES.pullResumeOnline, jobIds);
//    console.log(pullResumeOnlineSql);

    var conn1 = getPoolConnection();
    var rows = fetchVNWData(conn1, pullResumeOnlineSql);
    conn1.release();

//    console.log('applications online length: ', rows.length);
    _.each(rows, function (row) {
        queueApplication.add(function (done) {
            var application = Collections.Applications.findOne({entryId: row.entryid});
            if (!application) {
                var newApplication = new Schemas.Application();
                newApplication.entryId = row.entryid;
                newApplication.companyId = companyId;
                newApplication.jobId = row.jobid;
                newApplication.candidateId = row.userid;
                newApplication.source = 1;
                newApplication.data = row;
                newApplication.createdAt = row.createddate;
                Collections.Applications.insert(newApplication);

                // Log applied activity
                var activity = new Activity();
                activity.companyId = companyId;
                activity.data = {
                    applicationId: newApplication.entryId,
                    source: 1,
                    userId: row.userid
                };
                activity.createdAt = new Date(row.createddate);
                activity.appliedJob();
            } else {
                if (!_.isEqual(application.data, row)) {
                    Collections.Applications.update(application._id, {
                        $set: {
                            data: row,
                            lastSyncedAt: new Date()
                        }
                    });
                }
            }

            // Push to pull candidates
            candidates.push(row.userid);
            entryIds.push(row.entryid);
            done();
        });

    });

    // PULL applications that sent directly

    var pullResumeDirectlySql = sprintf(VNW_QUERIES.pullResumeDirectly, jobIds);

    var conn2 = getPoolConnection();
    var rows1 = fetchVNWData(conn2, pullResumeDirectlySql);
    conn2.release();

    //console.log('applications direct length: ', rows.length);
    _.each(rows1, function (row) {
        queueApplication.add(function (done) {
            var application = Collections.Applications.findOne({entryId: row.sdid});
            if (!application) {
                var newApplication = new Schemas.Application();
                newApplication.entryId = row.sdid;
                newApplication.jobId = row.jobid;
                newApplication.companyId = companyId;
                newApplication.candidateId = row.userid;
                newApplication.source = 2;
                newApplication.data = row;
                newApplication.createdAt = row.createddate;
                Collections.Applications.insert(newApplication);

                // Log applied activity
                var activity = new Activity();
                activity.companyId = companyId;
                activity.data = {
                    applicationId: newApplication.entryId,
                    source: 2,
                    userId: row.userid
                };
                activity.createdAt = new Date(row.createddate);
                activity.appliedJob();
            } else {
                if (!_.isEqual(application.data, row)) {
                    Collections.Applications.update(application._id, {
                        $set: {
                            data: row,
                            lastSyncedAt: new Date()
                        }
                    });
                }
            }
            // Push to pull candidates and application scores
            candidates.push(row.userid);
            entryIds.push(row.sdid);
            done();
        })
    });
    //console.log('end application queue');
    queueApplication.run();

    //SYNC_VNW.pullCandidates(candidates);
    //SYNC_VNW.pullApplicationScores(entryIds);
};