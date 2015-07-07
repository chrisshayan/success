var VNW_TABLES = Meteor.settings.tables,
    VNW_QUERIES = Meteor.settings.queries;

var fetchVNWData = Meteor.wrapAsync(function(sql, callback) {
    var connection = mysql.createConnection(Meteor.settings.mysql);
    // Open connection
    connection.connect(function (err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        console.log('connected as id ' + connection.threadId);
    });

    //execute
    connection.query(sql, function(err, rows, fields) {
        if( err ) throw err;
        callback(null, rows);
    });

    // Close connection
    connection.end();
});

//Namespace to share methods to manual sync data from Vietnamworks
SYNC_VNW = {};

/**
 * Pull new jobs and sync db
 * @param userId {Number} (Optional) Vietnamworks user id
 */
SYNC_VNW.pullJobs = function(userId) {
    check(userId, Number);

    var pullJobSql = sprintf(VNW_QUERIES.pullJobs, userId);
    try {
        var rows = fetchVNWData(pullJobSql);
        _.each(rows, function(row) {
                var job = Collections.Jobs.findOne({jobId: row.jobid});

                if( !job ) {
                    var job = new Schemas.Job();
                    job.jobId = row.jobid;
                    job.userId = userId;
                    job.data = row;
                    Collections.Jobs.insert(job);
                } else {
                    if( job.data != row ) {
                        Collections.Jobs.update(job._id, {$set: {
                            data: row,
                            lastSyncedAt: new Date()
                        }});
                    }
                }

            SYNC_VNW.pullApplications(row.jobid);
        });

    } catch (e) {
        console.log(e)
    }
}

SYNC_VNW.pullApplications = function(jobId) {
    check(jobId, Number);

    var candidates = [];
    var entryIds = [];
    var pullResumeOnlineSql = sprintf(VNW_QUERIES.pullResumeOnline, jobId);
    var rows = fetchVNWData(pullResumeOnlineSql);

    _.each(rows, function(row) {
        var can = Collections.Applications.findOne({entryId: row.entryid});
        if( !can ) {
            var can = new Schemas.Application();
            can.entryId = row.entryid;
            can.jobId = row.jobid;
            can.userId = row.userid;
            can.source = 1;
            can.data = row;
            Collections.Applications.insert(can);
        } else {
            if( can.data != row ) {
                Collections.Applications.update(can._id, {$set: {
                    data: row,
                    lastSyncedAt: new Date()
                }});
            }
        }

        // Push to pull candidates
        candidates.push( row.userid );
        entryIds.push( row.entryid );
    });

    // PULL applications that sent directly
    var pullResumeDirectlySql = sprintf(VNW_QUERIES.pullResumeDirectly, jobId);
    var rows1= fetchVNWData(pullResumeDirectlySql);
    _.each(rows1, function(row) {
        var can = Collections.Applications.findOne({entryId: row.sdid});
        if( !can ) {
            var can = new Schemas.Application();
            can.entryId = row.sdid;
            can.jobId = row.jobid;
            can.userId = row.userid;
            can.source = 2;
            can.data = row;
            Collections.Applications.insert(can);
        } else {
            if( can.data != row ) {
                Collections.Applications.update(can._id, {$set: {
                    data: row,
                    lastSyncedAt: new Date()
                }});
            }
        }
        // Push to pull candidates and application scores
        candidates.push( row.userid );
        entryIds.push( row.sdid );
    });

    SYNC_VNW.pullCandidates( candidates );
    SYNC_VNW.pullApplicationScores( entryIds );
};


SYNC_VNW.pullCandidates = function(candidates) {
    check(candidates, Array);

    var pullCandidatesSql = sprintf(VNW_QUERIES.pullCandidates, candidates.join(","));

    try {
        var rows = fetchVNWData(pullCandidatesSql);
        _.each(rows, function(row) {
            var can = Collections.Candidates.findOne({userId: row.userid});

            if( !can ) {
                var can = new Schemas.Candidate();
                can.userId = row.userid;
                can.data = row;
                Collections.Candidates.insert(can);
            } else {
                if( can.data != row ) {
                    Collections.Jobs.update(can._id, {$set: {
                        data: row,
                        lastSyncedAt: new Date()
                    }});
                }
            }
        });

    } catch (e) {
        console.log(e)
    }
}


SYNC_VNW.pullApplicationScores = function( entryIds ) {
    check(entryIds, Array);

    var pullApplicationScoreSql = sprintf(VNW_QUERIES.pullApplicationScores, entryIds.join(","));
    try {
        var rows = fetchVNWData(pullApplicationScoreSql);
        _.each(rows, function(row) {
            var score = Collections.ApplicationScores.findOne({entryId: row.applicationId});
            if( !score ) {
                var score = new Schemas.ApplicationScore();
                score.entryId = row.applicationId;
                score.data = row;
                Collections.ApplicationScores.insert(score);
            } else {
                if( score.data != row ) {
                    Collections.ApplicationScores.update(score._id, {$set: {
                        data: row,
                        lastSyncedAt: new Date()
                    }});
                }
            }
        });

    } catch (e) {
        console.log(e)
    }
}

SYNC_VNW.run = function() {
    var users = Collections.Users.find().fetch();
    _.each(users, function(user) {
        SYNC_VNW.pullJobs(user.userId);
    });
};