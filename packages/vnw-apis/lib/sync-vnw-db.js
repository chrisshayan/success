var VNW_TABLES = Meteor.settings.tables,
    VNW_QUERIES = Meteor.settings.queries;
var fetchVNWData = Meteor.wrapAsync(function (sql, callback) {


    //execute
    connection.query(sql, function (err, rows, fields) {
        if (err) throw err;
        callback(null, rows);
    });
});

//Namespace to share methods to manual sync data from Vietnamworks
SYNC_VNW = {};

/**
 * Pull company info
 */
SYNC_VNW.pullCompanyInfo = function (companyId) {
    check(companyId, Number);
    var pullCompanyInfoSql = sprintf(VNW_QUERIES.pullCompanyInfo, companyId);
    try {
        var rows = fetchVNWData(pullCompanyInfoSql);
        _.each(rows, function (row) {
            var company = Collections.Companies.findOne({companyId: row.companyid});

            if (!company) {
                company = new Schemas.CompanyInfo();
                company.companyId = row.companyid;
                company.data = row;
                Collections.Companies.insert(company);
            } else {
                if (company.data != row) {
                    Collections.Companies.update(company._id, {
                        $set: {
                            data: row,
                            lastSyncedAt: new Date()
                        }
                    });
                }
            }
        });

    } catch (e) {
        debuger(e);
    }
}

/**
 * Pull new jobs and sync db
 * @param userId {Number} (Optional) Vietnamworks user id
 */
SYNC_VNW.pullJobs = function (userId) {
    check(userId, Number);

    var pullJobSql = sprintf(VNW_QUERIES.pullJobs, userId);
    try {
        var rows = fetchVNWData(pullJobSql);
        _.each(rows, function (row) {
            var job = Collections.Jobs.findOne({jobId: row.jobid});

            if (!job) {
                var job = new Schemas.Job();
                job.jobId = row.jobid;
                job.userId = userId;
                job.data = row;
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

            SYNC_VNW.pullApplications(row.jobid);
        });

    } catch (e) {
        debuger(e)
    }
}

SYNC_VNW.pullApplications = function (jobId) {
    check(jobId, Number);

    var candidates = [];
    var entryIds = [];
    var pullResumeOnlineSql = sprintf(VNW_QUERIES.pullResumeOnline, jobId);
    var rows = fetchVNWData(pullResumeOnlineSql);

    _.each(rows, function (row) {
        var can = Collections.Applications.findOne({entryId: row.entryid});
        if (!can) {
            var can = new Schemas.Application();
            can.entryId = row.entryid;
            can.jobId = row.jobid;
            can.userId = row.userid;
            can.source = 1;
            can.data = row;
            Collections.Applications.insert(can);
        } else {
            if (!_.isEqual(can.data, row)) {
                Collections.Applications.update(can._id, {
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
    });

    // PULL applications that sent directly
    var pullResumeDirectlySql = sprintf(VNW_QUERIES.pullResumeDirectly, jobId);
    var rows1 = fetchVNWData(pullResumeDirectlySql);
    _.each(rows1, function (row) {
        var can = Collections.Applications.findOne({entryId: row.sdid});
        if (!can) {
            var can = new Schemas.Application();
            can.entryId = row.sdid;
            can.jobId = row.jobid;
            can.userId = row.userid;
            can.source = 2;
            can.data = row;
            Collections.Applications.insert(can);
        } else {
            if (!_.isEqual(can.data, row)) {
                Collections.Applications.update(can._id, {
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
    });

    SYNC_VNW.pullCandidates(candidates);
    SYNC_VNW.pullApplicationScores(entryIds);
};


SYNC_VNW.pullCandidates = function (candidates) {
    check(candidates, Array);
    if(candidates.length < 1) return;

    var pullCandidatesSql = sprintf(VNW_QUERIES.pullCandidates, candidates.join(","));

    try {
        var rows = fetchVNWData(pullCandidatesSql);
        _.each(rows, function (row) {
            var can = Collections.Candidates.findOne({userId: row.userid});

            if (!can) {
                var can = new Schemas.Candidate();
                can.userId = row.userid;
                can.data = row;
                Collections.Candidates.insert(can);
            } else {
                if (!_.isEqual(can.data, row)) {
                    Collections.Jobs.update(can._id, {
                        $set: {
                            data: row,
                            lastSyncedAt: new Date()
                        }
                    });
                }
            }
        });

    } catch (e) {
        debuger(e)
    }
}


SYNC_VNW.pullApplicationScores = function (entryIds) {
    check(entryIds, Array);
    if(entryIds.length < 1) return;

    var pullApplicationScoreSql = sprintf(VNW_QUERIES.pullApplicationScores, entryIds.join(","));
    try {
        var rows = fetchVNWData(pullApplicationScoreSql);
        _.each(rows, function (row) {
            var application = Collections.Applications.findOne({entryId: row.applicationId});
            if (application) {
                if (!_.isEqual(application.matchingScore, row.matchingScore)) {
                    Collections.Applications.update(application._id, {
                        $set: {
                            matchingScore: row.matchingScore
                        }
                    });
                }
            }
        });

    } catch (e) {
        debuger(e)
    }
}

SYNC_VNW.run = function () {
    var connection = mysql.createConnection(Meteor.settings.mysql);
    // Open connection
    connection.connect(function (err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        debuger('connected as id ' + connection.threadId);
    });
    var users = Collections.Users.find().fetch();
    _.each(users, function (user) {
        Meteor.defer(function () {
            SYNC_VNW.pullCompanyInfo(user.data.companyid);
        });
        Meteor.defer(function () {
            SYNC_VNW.pullJobs(user.userId);
        });
    });


    // Close connection
    connection.end();
};