/**
 * Created by HungNguyen on 8/5/15.
 */

CRON_VNW = {};

function formatDatetimeFromVNW(datetime) {
    var d = moment(datetime);
    var offsetBase = 420;
    var offsetServer = new Date().getTimezoneOffset();
    var subtract = offsetBase + offsetServer;
    d.subtract(subtract, 'minute');
    return d.toDate();
}

function parseTimeToString(date) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
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
    Collections.SyncQueue.update({type: "cronData", status: "completed"}, {$set: {status: "ready", runId: null}})
};

CRON_VNW.addQueueCron = function (type, data) {
    Job(Collections.SyncQueue, type, data).save();
};


function cronData(j, cb) {
    var info = j.data;
    var userId = info.userId
        , companyId = info.companyId
        , lastRunObj = moment(info.lastUpdated || info.doc.created)
        , lastRunFormat = lastRunObj.format('YYYY-MM-DD HH:mm:ss');
    console.log('last sync: ', lastRunFormat);
    //get latest syncTime

    try {
        //get all jobs
        var jSql = sprintf(VNW_QUERIES.cronJobsUpdate, userId);
        //console.log('jsql : ', jSql);
        var conn = mysqlManager.getPoolConnection();
        var updateJobs = fetchVNWData(conn, jSql);
        conn.release();

        updateJobs.forEach(function (job) {
            if (moment(job.createdAt) > lastRunObj || moment(job.updatedAt) > lastRunObj) {
                processJob(job, companyId);
            }
        });

        if (updateJobs.length) {
            var jobIds = _.pluck(updateJobs, 'typeId');

            // - Check new application of this job if available.
            // - Then insert / update / remove

            var appSql = sprintf(VNW_QUERIES.cronApplicationsUpdate, jobIds, lastRunFormat, jobIds, lastRunFormat);
            //console.log('appSql', appSql);

            var appConn = mysqlManager.getPoolConnection();
            var appRows = fetchVNWData(appConn, appSql);
            appConn.release();

            if (appRows.length) {
                cronApps(appRows, companyId);
                var candidates = _.pluck(appRows, 'candidateId');
                processCandidates(candidates);
            }

        }

        Collections.SyncQueue.update({_id: j.doc._id}, {
            '$set': {
                'data.lastUpdated': j.doc.updated
            }
        });

        j.done();

    } catch (e) {
        j.fail();
        throw e;
    }


    cb();
}

function processJob(item, companyId) {
    var mongoJob = Collections.Jobs.findOne({jobId: item.typeId});
    //remove
    if (mongoJob && item.isdeleted) {
        Collections.Jobs.remove({jobId: item.typeId});

    } else {
        var getJobQuery = sprintf(VNW_QUERIES.pullJob, item.typeId);
        //console.log(getJobQuery);
        var conn = mysqlManager.getPoolConnection();
        var cJobs = fetchVNWData(conn, getJobQuery);
        cJobs.forEach(function (jRow) {
            var query = {
                jobId: item.typeId
            };
            var job = new Schemas.Job();
            job.jobId = jRow.jobid;
            job.companyId = companyId;
            job.userId = jRow.userid;
            job.data = jRow;
            job.expiredAt = formatDatetimeFromVNW(jRow.expireddate);
            job.createdAt = formatDatetimeFromVNW(jRow.createddate);
            job.updatedAt = formatDatetimeFromVNW(jRow.lastupdateddate);

            // update

            if (mongoJob
                && (parseTimeToString(mongoJob.createdAt) !== parseTimeToString(job.createdAt)
                || parseTimeToString(mongoJob.updatedAt) !== parseTimeToString(job.updatedAt))) {
                console.log('update Job :', job.jobId);

                console.log('previous info create : %s, update :%s', mongoJob.createdAt, mongoJob.updatedAt);
                console.log('new info create : %s, update :%s', job.createdAt, job.updatedAt);
                Collections.Jobs.update(query, job);

                // add new
            } else if (!mongoJob) {
                console.log('create Job :', job.jobId);
                Collections.Jobs.insert(job);
            }
        });
    }
}

function processApp(appRows, companyId) {

    appRows.forEach(function (row) {
        var appId = row.entryid || row.sdid;
        if (row.deleted_by_employer !== 0 || row.deleted_by_jobseeker !== 0) {
            Collections.Applications.remove({entryId: appId});

        } else if (!Collections.Applications.findOne({entryId: appId})) {
            var application = new Schemas.Application();
            application.entryId = appId;
            application.companyId = companyId;
            application.jobId = row.jobid;
            application.candidateId = row.userid;
            application.source = 1;
            application.data = row;
            application.createdAt = formatDatetimeFromVNW(row.createddate);

            console.log('insert application:', application.entryId);
            Collections.Applications.insert(application);
        }
    });
}

function processCandidates(candidateList) {
    var getCandidatesSQL = sprintf(VNW_QUERIES.getCandiatesInfo, candidateList);
    var conn = mysqlManager.getPoolConnection();
    var candidateRows = fetchVNWData(conn, getCandidatesSQL);
    conn.release();

    candidateRows.forEach(function (row) {
        var candidate = Collections.Candidates.findOne({candidateId: row.userid});
        if (!candidate) {
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


function cronApps(appRows, companyId) {
    //appRows.source 1 : online, appRows.source 2 : direct
    var groupedApp = _.groupBy(appRows, 'source');
    //console.log('online : %s, direct : %s', groupedApp['1'], groupedApp['2']);
    var conn;

    if (groupedApp['1']) {
        var appOnlineSQL = sprintf(VNW_QUERIES.pullAllAppsOnline, _.pluck(groupedApp['1'], 'typeId').join(','));
        //    console.log('appOnline', appOnlineSQL);
        conn = mysqlManager.getPoolConnection();
        var appOnlineRows = fetchVNWData(conn, appOnlineSQL);
        conn.release();
        if (appOnlineRows.length > 0) {
            processApp(appOnlineRows, companyId);
        }
    }
    if (groupedApp['2']) {
        var appDirectSQL = sprintf(VNW_QUERIES.pullAllAppsDirect, _.pluck(groupedApp['2'], 'typeId').join(','));
        //     console.log('appDirect', appDirectSQL);
        conn = mysqlManager.getPoolConnection();
        var appDirectRows = fetchVNWData(conn, appDirectSQL);
        conn.release();
        if (appDirectRows.length > 0) {
            processApp(appDirectRows, companyId);
        }
    }

}

/*
 * Below is data that only does cron once a day
 *
 */

function cronCity() {

}


// Cron tbkskill_term table

function cronSkills() {
    var skillTermsQuery = VNW_QUERIES.getSkillTerm;
    //    console.log('appOnline', appOnlineSQL);
    var conn = mysqlManager.getPoolConnection();
    var skillRows = fetchVNWData(conn, skillTermsQuery);
    conn.release();

    skillRows.forEach(function (row) {
        var skill = new Schemas.skill();
        skill.skillId = row.skillId;
        skill.skillName = row.skillName;
        Collections.SkillTerms.insert(skill);
    })
}


Collections.SyncQueue.processJobs('cronData', {concurrency: 20, payload: 1}, cronData);
