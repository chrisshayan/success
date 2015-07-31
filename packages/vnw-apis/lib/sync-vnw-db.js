function formatDatetimeFromVNW(datetime) {
    var d = moment(datetime);
    var offsetBase = 420;
    var offsetServer = new Date().getTimezoneOffset();
    var subtract = offsetBase + offsetServer;
    d.subtract(subtract, 'minute');
    return d.toDate();
}

var VNW_TABLES = Meteor.settings.tables,
    VNW_QUERIES = Meteor.settings.queries;


/*var fetchVNWData = Meteor.wrapAsync(function (sql, callback) {
 //execute
 connection.query(sql, function (err, rows, fields) {
 if (err) throw err;
 callback(null, rows);
 });
 });*/


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

//Namespace to share methods to manual sync data from Vietnamworks
SYNC_VNW = {};

/**
 * Pull company info
 */
SYNC_VNW.pullCompanyInfo = function (companyId) {
    check(companyId, Number);
    var pullCompanyInfoSql = sprintf(VNW_QUERIES.pullCompanyInfo, companyId);
    try {
        var conn = getPoolConnection();
        var rows = fetchVNWData(conn, pullCompanyInfoSql);
        conn.release();
        _.each(rows, function (row) {
            var company = Collections.CompanySettings.findOne({companyId: row.companyid});

            if (!company) {
                company = new Schemas.CompanySetting();
                company.logo = row.logo;
                company.companyId = row.companyid;
                company.data = row;
                company.companyName = row.companyname;
                company.companyAddress = row.address;
                company.contactName = row.contactname;
                company.phone = row.telephone;
                company.cell = row.cellphone;
                company.fax = row.faxnumber;
                Collections.CompanySettings.insert(company);
            } else {
                if (company.data != row) {
                    Collections.CompanySettings.update(company._id, {
                        $set: {
                            logo: row.logo,
                            data: row,
                            companyName: row.companyname,
                            companyAddress: row.address,
                            contactName: row.contactname,
                            phone: row.telephone,
                            cell: row.cellphone,
                            fax: row.faxnumber,
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
SYNC_VNW.pullJobs = function (userId, companyId) {
    check(userId, Number);
    check(companyId, Number);

    var pullJobSql = sprintf(VNW_QUERIES.pullJobs, userId);
    try {
        var conn = getPoolConnection();
        var rows = fetchVNWData(conn, pullJobSql);
        conn.release();
        _.each(rows, function (row) {
            var job = new Schemas.Job();
            job.jobId = row.jobid;
            job.companyId = companyId;
            job.userId = userId;
            job.data = row;
            job.createdAt = formatDatetimeFromVNW(row.createddate);
            Collections.Jobs.upsert({jobId: row.jobid}, job);

            SYNC_VNW.pullApplications(row.jobid, companyId);
        });

    } catch (e) {
        debuger(e)
    }

    Collections.Users.update({userId: userId}, {$set: {isSynchronizing: false}});
}

SYNC_VNW.pullApplications = function (jobId, companyId) {
    check(jobId, Number);
    check(companyId, Number);

    var candidates = [];
    var entryIds = [];
    var pullResumeOnlineSql = sprintf(VNW_QUERIES.pullResumeOnline, jobId);
    var conn = getPoolConnection();
    var rows = fetchVNWData(conn, pullResumeOnlineSql);
    conn.release();

    _.each(rows, function (row) {
        var can = Collections.Applications.findOne({entryId: row.entryid});
        if (!can) {
            var can = new Schemas.Application();
            can.entryId = row.entryid;
            can.companyId = companyId;
            can.jobId = row.jobid;
            can.candidateId = row.userid;
            can.source = 1;
            can.data = row;
            can.createdAt = formatDatetimeFromVNW(row.createddate);
            Collections.Applications.insert(can);

            // Log applied activity
            var activity = new Activity();
            activity.companyId = companyId;
            activity.data = {
                applicationId: can.entryId,
                source: 1,
                userId: row.userid
            };
            activity.createdAt = formatDatetimeFromVNW(row.createddate);
            activity.appliedJob();
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
    var conn = getPoolConnection();
    var rows1 = fetchVNWData(conn, pullResumeDirectlySql);
    conn.release();
    _.each(rows1, function (row) {
        var can = Collections.Applications.findOne({entryId: row.sdid});
        if (!can) {
            var can = new Schemas.Application();
            can.entryId = row.sdid;
            can.jobId = row.jobid;
            can.companyId = companyId;
            can.candidateId = row.userid;
            can.source = 2;
            can.data = row;
            can.createdAt = formatDatetimeFromVNW(row.createddate);
            Collections.Applications.insert(can);

            // Log applied activity
            var activity = new Activity();
            activity.companyId = companyId;
            activity.data = {
                applicationId: can.entryId,
                source: 2,
                userId: row.userid
            };
            activity.createdAt = formatDatetimeFromVNW(row.createddate);
            activity.appliedJob();
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

    Meteor.defer(function () {
        SYNC_VNW.pullCandidates(candidates);
    });
    Meteor.defer(function () {
        SYNC_VNW.pullApplicationScores(entryIds);
    });
};


SYNC_VNW.pullCandidates = function (candidates) {
    check(candidates, Array);
    if (candidates.length < 1) return;

    var pullCandidatesSql = sprintf(VNW_QUERIES.pullCandidates, candidates);

    try {
        var conn = getPoolConnection();
        var rows = fetchVNWData(conn, pullCandidatesSql);
        conn.release();
        _.each(rows, function (row) {
            var can = Collections.Candidates.findOne({userId: row.userid});

            if (!can) {
                var can = new Schemas.Candidate();
                can.candidateId = row.userid;
                can.data = row;
                can.createdAt = formatDatetimeFromVNW(row.createddate);
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
    if (entryIds.length < 1) return;

    var pullApplicationScoreSql = sprintf(VNW_QUERIES.pullApplicationScores, entryIds.join(","));
    try {
        var conn = getPoolConnection();
        var rows = fetchVNWData(conn, pullApplicationScoreSql);
        conn.release();
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

Workers = {};

Workers.initialCompany = function (userId, companyId) {
    // Insert company info
    SYNC_VNW.sync([userId]);
}

Workers.analyticJobs = function (companyId, items) {
    check(companyId, Number);
    check(items, Array);
    var result = {
        added: [],
        changed: [],
        removed: []
    };

    var oldIds = Collections.Jobs.find({companyId: companyId}, {fields: {jobId: 1}}).map(function (doc) {
        return doc.jobId
    });
    var newIds = _.pluck(items, 'typeId');

    result.added = _.difference(newIds, oldIds);
    result.removed = _.difference(oldIds, newIds);

    var elseIds = _.difference(newIds, _.union(result.added, result.changed));
    var oldItems = Collections.Jobs.find({jobId: {$in: elseIds}}, {
        fields: {
            jobId: 1,
            "data.lastupdateddate": 1
        }
    }).map(function (doc) {
        return {
            type: "job",
            typeId: doc.jobId,
            updatedAt: doc.data.lastupdateddate
        }
    });

    _.each(oldItems, function (oldDoc) {
        var newDoc = _.findWhere(items, {typeId: oldDoc.typeId});
        if (newDoc && !_.isEqual(newDoc.updatedAt, oldDoc.updatedAt)) {
            result.changed.push(newDoc.typeId);
        }
    });

    return result;
}

Workers.analyticApplications = function (companyId, items) {
    check(companyId, Number);
    check(items, Array);
    var result = {
        added: [],
        changed: [],
        removed: []
    };
    if (items.length <= 0) return result;

    var oldIds = Collections.Applications.find({companyId: companyId}, {fields: {entryId: 1}}).map(function (doc) {
        return doc.entryId;
    });
    var newIds = _.pluck(items, 'typeId');
    var addedIds = _.difference(newIds, oldIds);
    var removedIds = _.difference(oldIds, newIds);
    var elseIds = _.difference(newIds, _.union(addedIds, removedIds));

    var oldItems = Collections.Applications.find({entryId: {$in: elseIds}}, {
        fields: {
            entryId: 1,
            "data.savedate": 1
        }
    }).map(function (doc) {
        return {
            type: "application",
            typeId: doc.entryId,
            updatedAt: doc.data.savedate
        }
    });

    _.each(oldItems, function (oldDoc) {
        var newDoc = _.findWhere(items, {typeId: oldDoc.typeId});
        if (newDoc && !_.isEqual(newDoc.updatedAt, oldDoc.updatedAt)) {
            result.changed.push(newDoc);
        }
    });

    _.each(addedIds, function (typeId) {
        var _doc = _.findWhere(items, {typeId: typeId});
        if (_doc)
            result.added.push(_doc);
    });

    _.each(removedIds, function (typeId) {
        var _doc = _.findWhere(items, {typeId: typeId});
        if (_doc)
            result.removed.push(_doc);
    });

    return result;
}

Workers.insertVNWJob = function (jobId, companyId) {
    var pullJobSql = sprintf(VNW_QUERIES.pullJob, jobId);
    try {
        var conn = getPoolConnection();
        var rows = fetchVNWData(conn, pullJobSql);
        conn.release();
        _.each(rows, function (row) {
            var job = new Schemas.Job();
            job.jobId = row.jobid;
            job.companyId = companyId;
            job.userId = row.userid;
            job.data = row;
            job.expiredAt = formatDatetimeFromVNW(row.expireddate);
            job.createdAt = formatDatetimeFromVNW(row.createddate);
            Collections.Jobs.insert(job);

            SYNC_VNW.pullApplications(jobId, companyId);
        });

    } catch (e) {
        debuger(e)
    }
}

Workers.updateVNWJob = function (jobId, companyId) {
    var pullJobSql = sprintf(VNW_QUERIES.pullJob, jobId);
    try {
        var conn = getPoolConnection();
        var rows = fetchVNWData(conn, pullJobSql);
        conn.release();
        _.each(rows, function (row) {
            var criteria = {
                jobId: jobId
            };
            var modifier = {
                $set: {
                    data: row
                }
            }
            Collections.Jobs.update(criteria, modifier);
        });
    } catch (e) {
        debuger(e)
    }
}

Workers.deleteVNWJobs = function (jobIds) {
    try {
        check(jobIds, Array);
        if (jobIds.length <= 0) return true;

        var criteria = {
            jobId: {
                $in: jobIds
            }
        };
        Collections.Jobs.remove(criteria);
    } catch (e) {
        debuger(e)
    }
}

Workers.insertVNWApplication = function (data, companyId) {
    try {
        var query = sprintf(VNW_QUERIES.pullAppOnline, data.typeId);
        if (data.source == 2) {
            query = sprintf(VNW_QUERIES.pullAppDirect, data.typeId);
        }
        var conn = getPoolConnection();
        var rows = fetchVNWData(conn, query);
        conn.release();
        _.each(rows, function (row) {
            var app = new Schemas.Application();
            if (data.source == 1) {
                app.entryId = row.entryid;
            } else {
                app.entryId = row.sdid;
            }
            app.jobId = row.jobid;
            app.companyId = companyId;
            app.candidateId = row.userid;
            app.source = data.source;
            app.data = row;
            app.matchingScore = data.matchingScore;
            app.createdAt = formatDatetimeFromVNW(row.createddate);
            Collections.Applications.insert(app);

            Meteor.defer(function () {
                // Log applied activity
                var activity = new Activity();
                activity.companyId = companyId;
                activity.data = {
                    applicationId: app.entryId,
                    source: data.source,
                    userId: row.userid
                };
                activity.createdAt = formatDatetimeFromVNW(row.createddate);
                activity.appliedJob();

            });

            // Pull candidates
            SYNC_VNW.pullCandidates([app.candidateId]);
        });

    } catch (e) {
        debuger(e)
    }
}

Workers.updateVNWApplication = function (data, companyId) {
    try {
        var query = sprintf(VNW_QUERIES.pullAppOnline, data.typeId);
        if (data.source == 2) {
            query = sprintf(VNW_QUERIES.pullAppDirect, data.typeId);
        }
        var conn = getPoolConnection();
        var rows = fetchVNWData(conn, query);
        conn.release();
        _.each(rows, function (row) {
            var criteria = {
                entryId: data.typeId
            };
            var modifier = {
                $set: {
                    data: row,
                    matchingScore: data.matchingScore
                }
            }
            Collections.Applications.update(criteria, modifier);
        });

    } catch (e) {
        debuger(e)
    }
}

Workers.deleteVNWApplications = function (items) {
    try {
        check(items, Array);
        if (items.length <= 0) return true;
        var entryIds = _.pluck(items, 'typeId');

        var criteria = {
            entryId: {
                $in: entryIds
            }
        };
        Collections.Applications.remove(criteria);
    } catch (e) {
        debuger(e)
    }
}


SYNC_VNW.pullData = function (companyId, items) {
    check(items, Array);
    if (items.length <= 0) return true;
    // Check items new, updated, deleted
    var mainType = items[0].type;
    switch (mainType) {
        case "job":

            var result = Workers.analyticJobs(companyId, items);
            // Insert new job
            _.each(result.added, function (jobId) {
                Workers.insertVNWJob(jobId, companyId);
            });
            // Update new job
            _.each(result.changed, function (jobId) {
                Workers.updateVNWJob(jobId, companyId);
            });
            // Delete new jobs
            Workers.deleteVNWJobs(result.removed);

            break;

        case "application":
            var result = Workers.analyticApplications(companyId, items);
            // Insert new job
            _.each(result.added, function (app) {
                Workers.insertVNWApplication(app, companyId);
            });
            // Update new job
            _.each(result.changed, function (app) {
                Workers.updateVNWApplication(app, companyId);
            });
            // Delete new jobs
            Workers.deleteVNWApplications(result.removed);
            break;

        case "candidate":

            break;
        default:
            return true;
    }
}

SYNC_VNW.syncNewCompany = function (j, cb) {
    var user = j.data;
    var userId = user.userId;
    var companyId = user.companyId;
    Collections.Users.update(user._id, {$set: {isSynchronizing: true}});

    // GET ALL JOB IDS
    jSql = sprintf(VNW_QUERIES.checkJobsUpdate, userId);
    var conn = getPoolConnection();
    jRows = fetchVNWData(conn, jSql);
    conn.release();
    if (jRows.length <= 0) {
        Collections.Users.update(user._id, {$set: {isSynchronizing: false}});
        return true;
    }
    SYNC_VNW.pullData(companyId, jRows);

    var jobIds = _.pluck(jRows, 'typeId');
    if (jobIds.length > 0) {
        var appSql = sprintf(VNW_QUERIES.checkApplicationsUpdate, jobIds, jobIds);
        var conn = getPoolConnection();
        var appRows = fetchVNWData(conn, appSql);
        conn.release();
        if (appRows.length > 0) {
            // Sync applications
            SYNC_VNW.pullData(companyId, appRows);
        }
    }
    Collections.Users.update(user._id, {$set: {isSynchronizing: false}});
    j.done();
    cb();
}

SYNC_VNW.sync = function (users) {
    var connection = mysql.createConnection(Meteor.settings.mysql);
    // Open connection
    connection.connect(function (err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        debuger('connected as id ' + connection.threadId);
    });
    if (!users)
        var users = Collections.Users.find({isSynchronizing: false}).fetch();

    _.each(users, function (user) {
        Meteor.defer(function () {
            SYNC_VNW.addQueue('pullCompanyData', user);
        })
    });


    // Close connection
    connection.end();
}

SYNC_VNW.addQueue = function (type, data) {
    Job(Collections.SyncQueue, type, data).save();
}


Mongo.Collection.prototype.constructor = Mongo.Collection;
Collections.SyncQueue = JobCollection('vnw_sync_queue');
Collections.SyncQueue.processJobs('initCompany', {concurrency: 20, payload: 1}, SYNC_VNW.syncNewCompany);
Collections.SyncQueue.processJobs('pullCompanyData', {concurrency: 5, payload: 1}, SYNC_VNW.syncNewCompany);

Meteor.startup(function () {
    return Collections.SyncQueue.startJobServer();
});