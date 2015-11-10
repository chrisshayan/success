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


function processJob(row, companyId) {
    var expiredAt = formatDatetimeFromVNW(row.expireddate);
    var job = new vnwJob();

    job.companyId = +companyId;
    job.jobId = +row.jobid;
    job.userId = +row.userid;
    job.source = 'vnw';
    job.title = row.jobtitle;
    job.level = '';
    job.categories = [];
    job.locations = [];
    job.salaryMin = +row.salarymin;
    job.salaryMax = +row.salarymax;
    job.showSalary = true;
    job.description = row.jobdescription;
    job.requirements = row.skillexperience;

    job.recruiterEmails = _.unique(row.emailaddress.toLowerCase().match(/[A-Za-z\.0-9_]+@[a-zA-Z\.0-9_]+/g));

    job.vnwData = row;
    job.status = (moment(expiredAt).valueOf() < Date.now()) ? 0 : 1;
    job.createdAt = formatDatetimeFromVNW(row.createddate);
    job.updatedAt = formatDatetimeFromVNW(row.lastupdateddate);
    job.expiredAt = expiredAt;
    job.benefits = CRON_VNW.getBenefits(job.jobId);
    job.skills = CRON_VNW.getJobTags(job.jobId);


    if (!row.isactive)
        job.status = 2;
    else if (moment(expiredAt).valueOf() < Date.now())
        job.status = 0;
    else
        job.status = 1;

    console.log('create Job :', job.jobId);

    return job;
}


function getApplications(jobId) {
    var appSql = sprintf(VNW_QUERIES.cronApplicationsUpdate, jobId, jobId);

    var appRows = fetchVNWData(appSql);

    appRows.forEach(function (row) {
        var data = {
            jobId: jobId,
            entryId: row.typeId,
            source: row.source
        };

        sJobCollections.addJobtoQueue('addApplication', data);
    });

}

var Jobs = {
    addJobs: function (jc, cb) {
        try {
            var data = jc.data; // userId, companyId, jobId

            console.log('start add job: ', data);
            var mongoJob = Collections.Jobs.findOne({jobId: data.jobId});

            if (!mongoJob) {
                var getJobQuery = sprintf(VNW_QUERIES.pullJob, data.jobId);
                var cJobs = fetchVNWData(getJobQuery);

                cJobs.forEach(function (row) {
                    var job = processJob(row, data.companyId);
                    //Collections.Jobs.insert(job);

                    if (!job.isExist()) {
                        sJobCollections.addJobtoQueue('updateJob', data);
                    } else {
                        Collections.Jobs.insert(job);
                        getApplications(job.jobId);
                    }

                });
                console.log('job added');
            }
            console.log('end add job');


            jc.done();
            cb();
        } catch (e) {
            jc.fail();
            cb(e);
        }

    },
    updateJobs: function (jc, cb) {
        try {
            var data = jc.data; // userId, companyId, jobId

            console.log('start update job: ', data);

            var mongoJob = Collections.Jobs.findOne({jobId: data.jobId});

            if (mongoJob) {
                var getJobQuery = sprintf(VNW_QUERIES.pullJob, data.jobId);
                var cJobs = fetchVNWData(getJobQuery);

                if (cJobs.length) {

                    cJobs.forEach(function (row) {
                        var job = processJob(row, data.companyId);

                        var query = {jobId: data.jobId};
                        var modifier = {
                            '$set': job
                        };
                        Collections.Jobs.update(query, modifier);

                    });
                }
            }

            jc.done();
            cb();
        } catch (e) {
            jc.fail();
            cb(e);
            //throw e;
        }

    }
};

sJobCollections.registerJobs('addJob', Jobs.addJobs);
sJobCollections.registerJobs('updateJob', Jobs.updateJobs);