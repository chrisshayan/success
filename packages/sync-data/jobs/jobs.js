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

    var job = {
        companyId: +companyId,
        jobId: +row.jobid,
        userId: +row.userid,
        source: 'vnw',
        title: row.jobtitle,
        level: '',
        categories: [],
        locations: [],
        salaryMin: +row.salarymin,
        salaryMax: +row.salarymax,
        showSalary: true,
        description: row.jobdescription,
        requirements: row.skillexperience,
        benefits: '',
        recruiterEmails: _.unique(row.emailaddress.toLowerCase().match(/[A-Za-z\.0-9_]+@[a-zA-Z\.0-9_]+/g)),
        skills: [],
        vnwData: row,
        status: (moment(expiredAt).valueOf() < Date.now()) ? 0 : 1,
        createdAt: formatDatetimeFromVNW(row.createddate),
        updatedAt: formatDatetimeFromVNW(row.lastupdateddate),
        expiredAt: expiredAt
    };

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

    console.log(appRows.length);
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
                    Collections.Jobs.insert(job);
                    console.log('job', job.jobId);
                    getApplications(job.jobId);
                });
            }


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
                console.log('jobs : ', cJobs.length);
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
            } else {
                sJobCollections.addJobtoQueue('addJob', data);
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