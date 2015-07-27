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


SYNC_VNW.syncJob = function (companyId, userId, status) {
    var query = VNW_QUERIES.pullJobs;
    if (status == 'open')
        query = VNW_QUERIES.pullOpenJobs;
    if (status == 'closed')
        query = VNW_QUERIES.pullClosedJobs;

    var pullJobSql = sprintf(query, userId);

    var connection = getPoolConnection();
    var rows = fetchVNWData(connection, pullJobSql);
    //console.log(rows.length);
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
                    job.companyId = companyId;
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
                //SYNC_VNW.pullApplications(row.jobid, companyId);
                /*    Meteor.defer(function () {
                 SYNC_VNW.syncApplication(job.jobId, companyId);
                 });*/
                done();
            });
        });

        connection.release();

        SYNC_VNW.syncApplication(jobIds.join(','), companyId);
        queueJob.run();
    }
    catch
        (e) {
        connection.release();
        debuger(e)
    }


};