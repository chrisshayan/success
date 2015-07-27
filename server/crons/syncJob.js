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


var queueJob = new PowerQueue({
    isPaused: true
});

queueJob.onEnded = function () {
    console.log('sync job finished!');
};


SYNC_VNW.syncJob = function (companyId, userId, typeQuery) {
    var query = VNW_QUERIES.pullJobs;

    switch (typeQuery) {
        case 'open' :
            query = VNW_QUERIES.pullOpenJobs;
            break;
        case 'closed':
            query = VNW_QUERIES.pullClosedJobs;
            break;
        case 'cron':
            query = VNW_QUERIES.cronNewJobs;
            break;
        default :
            break;
    }

    var pullJobSql = sprintf(query, userId);

    var connection = getPoolConnection();
    var rows = fetchVNWData(connection, pullJobSql);
    if (rows.length == 0) return;

    var jobIds = _.pluck(rows, 'jobid');
    //console.log(jobIds.join(','));
    try {
        _.each(rows, function (row) {

            queueJob.add(function (done) {
                var job = Collections.Jobs.findOne({jobId: row.jobid});
                if (!job) {
                    //console.log('jobs:', row.jobid);
                    var job = new Schemas.Job();
                    job.jobId = row.jobid;
                    job.companyId = row.companyid;
                    job.userId = userId;
                    job.data = row;
                    job.createdAt = row.createddate;
                    Collections.Jobs.insert(job);
                } else {
                    if (!_.isEqual(job.data, row)) {
                        Collections.Jobs.update(job._id, {
                            $set: {
                                data: row,
                                lastSyncedAt: new Date()
                            }
                        });
                    }
                }
                //SYNC_VNW.pullApplications(row.jobid, companyIds);
                if (typeQuery === 'cron')
                    Meteor.defer(function () {
                        SYNC_VNW.syncApplication(job.jobId, row.companyid, true);
                    });

                done();
            });
        });

        connection.release();

        if (typeQuery !== 'cron')
            SYNC_VNW.syncApplication(jobIds.join(','), companyId);

        queueJob.run();
    }
    catch
        (e) {
        connection.release();
        debuger(e)
    }


};