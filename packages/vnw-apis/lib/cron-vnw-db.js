/**
 * Created by HungNguyen on 8/5/15.
 */

function formatDatetimeFromVNW(datetime) {
    var d = moment(datetime);
    var offsetBase = 420;
    var offsetServer = new Date().getTimezoneOffset();
    var subtract = offsetBase + offsetServer;
    d.subtract(subtract, 'minute');
    return d.toDate();
}

var VNW_TABLES = Meteor.settings.tables,
    VNW_QUERIES = Meteor.settings.cronQueries;


var fetchVNWData = Meteor.wrapAsync(function (connection, query, callback) {
    connection.query(query, function (err, rows, fields) {
        if (err) throw err;
        callback(err, rows);
    });
});


CRON_VNW.cron = function () {
    Collections.SyncQueue.update({type: "cronCompanyData", status: "completed"}, {$set: {status: "ready", runId: null}})
};

CRON_VNW.addQueueCron = function (type, data) {
    Job(Collections.SyncQueue, type, data).save();
};


function cronJobs(j, cb) {
    var info = j.info;
    var userId = info.userId
        , companyId = info.companyId
        , lastRun = info.lastUpdated || info.doc.created;

    //get latest syncTime
    var lastUpdated = (j.doc.updated) ? moment(j.doc.updated).format('YYYY-MM-DD HH:mm:ss') : null;
    if (!lastUpdated) {
        return '1stSyncData';
    }

    try {
        var jSql = sprintf(VNW_QUERIES.cronJobsUpdate, userId, lastRun);
        console.log('cron Jobs: ', jSql);
        var conn = mysqlManager.getPoolConnection();
        var updateJobs = fetchVNWData(conn, jSql);
        conn.release();
        updateJobs.forEach(function (job) {
            processJob(job, companyId);
            var appSql = sprintf(VNW_QUERIES.cronApplicationsUpdate, jobId, lastRun, jobId, lastRun);
            var appConn = mysqlManager.getPoolConnection();
            var appRows = fetchVNWData(appConn, appSql);
            appConn.release();

            if (appRows.length)
                cronApps(appRows, companyId);
        });


    } catch (e) {
        throw e;
    }

    Collections.SyncQueue.update({_id: j.doc._id}, {
        '$set': {
            'data.lastUpdated': j.doc.updated
        }
    });
}

function processJob(item, companyId) {
    var mongoJob = Collections.Jobs.findOne({jobId: item.typeId});

    //remove
    if (mongoJob && item.isdeleted) {
        Collections.Jobs.remove({jobId: item.typeId});

    } else {
        var getJobQuery = sprintf(VNW_QUERIES.pullJob, item.typeId);
        var conn = mysqlManager.getPoolConnection();
        var cJobs = fetchVNWData(conn, getJobQuery);

        cJobs.forEach(function (row) {
            var query = {
                jobId: item.typeId
            };
            var changes = {
                userId: row.userId,
                data: row,
                expiredAt: formatDatetimeFromVNW(row.expireddate),
                createdAt: formatDatetimeFromVNW(row.createddate),
                updatedAt: formatDatetimeFromVNW(row.lastupdateddate)
            };
            // update
            if (mongoJob && (mongoJob.createdAt != item.createdAt
                || mongoJob.updatedAt != item.updatedAt)) {
                Collections.Jobs.update(query, {$set: changes});

            // add new
            } else if (!mongoJob) {
                changes.companyId = companyId;

                Collections.Jobs.insert(query, changes);
            }
        });
    }
}

function processApp(appRows, companyId) {
    appRows.forEach(function (row) {
        var info = {
            entryId: row.entryid,
            companyId: companyId,
            jobId: row.jobid,
            candidateId: row.userid,
            source: 1,
            data: row,
            createdAt: formatDatetimeFromVNW(row.createddate)
        };

        Collections.Applications.insert(info);
    });
}


function cronApps(jobId, companyId) {
    var appSql = sprintf(VNW_QUERIES.checkApplicationsUpdate, jobId, jobId);

    var conn = mysqlManager.getPoolConnection();
    var appRows = fetchVNWData(conn, appSql);
    conn.release();
    if (appRows.length > 0) {
        processApp(appRows, companyId);
    }
}



function cronCompanyData(j, cb) {
    var user = j.data;
    var userId = user.userId;
    var companyId = user.companyId;


    try {
        // GET ALL JOB IDS

        var jSql = sprintf(VNW_QUERIES.cronJobsUpdate, userId);
        var conn = mysqlManager.getPoolConnection();
        var jRows = fetchVNWData(conn, jSql);
        conn.release();

        if (jRows.length <= 0) {
            return true;
        }
        SYNC_VNW.pullData(companyId, jRows);
        var jobIds = _.pluck(jRows, 'typeId');
        if (jobIds.length > 0) {
            while (jobIds.length > 0) {
                var chunk = jobIds.splice(0, 20);
                var appSql = sprintf(VNW_QUERIES.checkApplicationsUpdate, chunk, chunk);
                var connApplication = mysqlManager.getPoolConnection();
                var appRows = fetchVNWData(connApplication, appSql);
                connApplication.release();
                if (appRows.length > 0) {
                    // Sync applications
                    SYNC_VNW.pullData(companyId, appRows);
                }
            }

        }
        j.done();
    } catch (e) {
        j.fail(e);
        debuger(e);
    }

    cb();
}

