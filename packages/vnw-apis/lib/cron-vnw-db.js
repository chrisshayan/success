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
    var userId = info.userId,
        companyId = info.companyId;

    //get latest syncTime
    var lastUpdated = (j.doc.updated) ? moment(j.doc.updated).format('YYYY-MM-DD HH:mm:ss') : null;
    if (!lastUpdated) {
        return '1stSyncData';
    }


    try {
        var jSql = sprintf(VNW_QUERIES.cronJobsUpdate, userId);
        var conn = mysqlManager.getPoolConnection();
        var jRows = fetchVNWData(conn, jSql);
        conn.release();

    } catch (e) {
        throw e;
    }
}

function Temp() {
    items.forEach(function (item) {
        if (item.isdeleted) {
            result.removed.push(item['typeId']);
        }
        else if (item.updatedAt != '' || item.createdAt != '') {
            result.changed.push(item['typeId']);
        } else {
            result.added.push()
        }

    });
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

