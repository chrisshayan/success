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

var VNW_TABLES = Meteor.settings.tables,
    VNW_QUERIES = Meteor.settings.cronQueries;


var fetchVNWData = Meteor.wrapAsync(function (query, callback) {
    var conn = mysqlManager.getPoolConnection();

    conn.query(query, function (err, rows, fields) {
        if (err) throw err;
        conn.release();
        callback(err, rows);
    });
});


CRON_VNW.cron = function () {
    Collections.SyncQueue.update({type: "cronData", status: "completed"}, {$set: {status: "ready", runId: null}})
};

CRON_VNW.cronSkills = function () {
    Collections.SyncQueue.update({type: "cronSkills", status: {$in: ["completed", "failed"]}}, {
        $set: {
            status: "ready",
            runId: null
        }
    })
};

CRON_VNW.addQueueCron = function (type, data) {
    Job(Collections.SyncQueue, type, data).save();
};


function cronData(j, cb) {
    var info = j.data;
    var userId = info.userId
        , companyId = info.companyId
        , lastRunObj = moment(info.lastUpdated || j.doc.created)
       // , lastRunFormat = lastRunObj.format('YYYY-MM-DD HH:mm:ss')
        , lastRunApplication = moment(info.lastUpdatedApplication || j.doc.created).format('YYYY-MM-DD HH:mm:ss');

    //get latest syncTime

    try {
        //get all jobs
        var jSql = sprintf(VNW_QUERIES.cronJobsUpdate, userId);
        //console.log('jsql : ', jSql);
        var updateJobs = fetchVNWData(jSql);

        updateJobs.forEach(function (job) {
            if (moment(job.createdAt) > lastRunObj || moment(job.updatedAt) > lastRunObj) {
                processJob(job, companyId);
            }
        });

        if (updateJobs.length) {
            var jobIds = _.pluck(updateJobs, 'typeId');

            // - Check new application of this job if available.
            // - Then insert / update / remove

            var appSql = sprintf(VNW_QUERIES.cronApplicationsUpdate, jobIds, lastRunApplication, jobIds, lastRunApplication);
            //console.log('appSql', appSql);

            var appRows = fetchVNWData(appSql);

            if (appRows.length) {
                cronApps(appRows, companyId);
                var candidates = _.pluck(appRows, 'candidateId');
                processCandidates(candidates);
            }
        }

        var jobQuery = {companyId: companyId};
        var data = {};
        var options = {'sort': {updatedAt: -1}, 'limit': 1};
        var lastJob = Collections.Jobs.find(jobQuery, options).fetch();

        var aOptions = {'sort': {createdAt: -1}, 'limit': 1};
        var lastApp = Collections.Applications.find(jobQuery, aOptions).fetch();

        if (lastApp && lastApp.length)
            data['data.lastUpdatedApplication'] = formatDatetimeToVNW(lastApp[0].createdAt);

        if (lastJob && lastJob.length)
            data['data.lastUpdated'] = formatDatetimeToVNW(lastJob[0].updatedAt);

        console.log(data);

        Collections.SyncQueue.update({_id: j.doc._id}, {
            '$set': data
        });

        j.done();

    }
    catch
        (e) {
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
        console.log("processJob")
    } else {
        var getJobQuery = sprintf(VNW_QUERIES.pullJob, item.typeId);
        //console.log(getJobQuery);
        var cJobs = fetchVNWData(getJobQuery);
        cJobs.forEach(function (jRow) {
            var query = {
                jobId: item.typeId
            };
            var job = new Schemas.Job();
            job.jobId = jRow.jobid;
            job.companyId = companyId;
            job.userId = jRow.userid;
            job.vnwData = jRow;
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
    var filter = {
        fields: {
            candidateId: 1,
            'data.firstname': 1,
            'data.lastname': 1
        }
    };

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
    var candidateRows = fetchVNWData(getCandidatesSQL);

    SYNC_VNW.migration(candidateRows);

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
        var appOnlineRows = fetchVNWData(appOnlineSQL);
        if (appOnlineRows.length > 0) {
            processApp(appOnlineRows, companyId);
        }
        Meteor.defer(function () {
            _.each(appOnlineRows, function (item) {
                console.log('cron resume: ', item.resumeid);
                item.resumeid && SYNC_VNW.syncResume(item.resumeid);
            });
        })


    }
    if (groupedApp['2']) {
        var appDirectSQL = sprintf(VNW_QUERIES.pullAllAppsDirect, _.pluck(groupedApp['2'], 'typeId').join(','));
        //     console.log('appDirect', appDirectSQL);
        var appDirectRows = fetchVNWData(appDirectSQL);

        if (appDirectRows.length > 0) {
            processApp(appDirectRows, companyId);
        }
    }

}


/*
 * Below is data that only does cron once a day
 *
 */

CRON_VNW.cronCity = function () {
    // Remove old one
    Collections.Cities.remove({});

    var skillTermsQuery = VNW_QUERIES.cronCities;


    fetchVNWData(skillTermsQuery).forEach(function (row) {
        var city = new Schemas.city();

        city.id = row.cityid;
        city.languageId = row.languageid;
        city.country = row.countryid;
        city.name = row.cityname;
        city.order = row.cityorder;
        Collections.Cities.insert(city);
    });

    console.log('CronCity : Done!');

};

CRON_VNW.cronDegree = function () {
    // Remove old one
    Collections.Degrees.remove({});

    var skillTermsQuery = VNW_QUERIES.cronDegrees;

    fetchVNWData(skillTermsQuery).forEach(function (row) {
        var degree = new Schemas.degree();

        degree.languageId = row.languageid;
        degree.id = row.highestdegreeid;
        degree.highestDegreeName = row.highestdegreename;
        degree.highestDegreeOrder = row.highestdegreeorder;
        degree.weight = row.weight;
        degree.isExact = row.isexact;
        Collections.Degrees.insert(degree);
    });
    //console.log(degreeRows);
    console.log('CronDegree : Done!');
};


// Cron tbkskill_term table

function cronSkills(j, cb) {
    try {
        var skillTermsQuery = VNW_QUERIES.cronSkillTerm;

        var skillRows = fetchVNWData(skillTermsQuery);
        console.log('cronSkill run: ', skillRows.length);
        var storedSkills = Collections.SkillTerms.find().count();
        if (skillRows.length !== storedSkills) {
            skillRows.forEach(function (row) {
                var existSkill = Collections.SkillTerms.findOne({skillId: row.skillId});

                if (!existSkill) {
                    var skill = new Schemas.skill();
                    skill.skillId = row.skillId;
                    skill.skillName = row.skillName;
                    Collections.SkillTerms.insert(skill);
                }

            });
        }
        console.log('cronSkills done!');
        j.done();
    } catch (e) {
        console.log(e);
        j.fail();
    }
    cb();
}

Collections.SyncQueue.processJobs('cronData', {concurrency: 20, payload: 1}, cronData);
Collections.SyncQueue.processJobs('cronSkills', {concurrency: 20, payload: 1}, cronSkills);
