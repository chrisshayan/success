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


var fetchVNWData = Meteor.wrapAsync(function (connection, query, callback) {
    connection.query(query, function (err, rows, fields) {
        if (err) throw err;
        callback(err, rows);
    });
});

//Namespace to share methods to manual sync data from VietnamSYNC_VNW
SYNC_VNW = {};


//Namespace to share methods to manual sync data from VietnamSYNC_VNW
SYNC_VNW.syncUser = function (userInfo) {
    var _user = Collections.Users.findOne({userId: userInfo.userid});

    if (!_user) {
        _user = new Schemas.User();
        _user.data = userInfo;
        _user.companyId = userInfo.companyid;
        _user.userId = userInfo.userid;
        _user.username = userInfo.username;
        _user.createdAt = userInfo.createddate;
        Collections.Users.insert(_user);

        //Intitial user data
        Meteor.defer(function () {
            Recruit.initialEmployerData(userInfo.userid, userInfo.username, userInfo.companyid);
            SYNC_VNW.pullCompanyInfo(userInfo.companyid);
            var jobData = {
                userId: _user.userId,
                companyId: userInfo.companyid
            };

            SYNC_VNW.addQueue('pullCompanyData', jobData);
        });
    } else if (!_.isEqual(_user.data, userInfo)) {
        Collections.Users.update(_user._id, {$set: {data: userInfo, lastSyncedAt: new Date()}});
    }

    return _user;
};


/**
 * Pull company info
 */
SYNC_VNW.pullCompanyInfo = function (companyId) {
    check(companyId, Number);
    var pullCompanyInfoSql = sprintf(VNW_QUERIES.pullCompanyInfo, companyId);
    try {
        var conn = mysqlManager.getPoolConnection();
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
};

SYNC_VNW.pullApplications = function (jobId, companyId) {
    check(jobId, Number);
    check(companyId, Number);

    var candidates = [];
    var entryIds = [];
    var pullApplicationOnlineSql = sprintf(VNW_QUERIES.pullApplicationOnline, jobId);
    var conn = mysqlManager.getPoolConnection();
    var rows = fetchVNWData(conn, pullApplicationOnlineSql);
    conn.release();

    _.each(rows, function (row) {
        var applicationOnline = new Schemas.Application();
        applicationOnline.entryId = row.entryid;
        applicationOnline.companyId = companyId;
        applicationOnline.jobId = row.jobid;
        applicationOnline.candidateId = row.userid;
        applicationOnline.source = 1;
        applicationOnline.data = row;
        applicationOnline.createdAt = formatDatetimeFromVNW(row.createddate);
        Collections.Applications.insert(applicationOnline);

        // Log applied activity
        var activity = new Activity();
        activity.companyId = companyId;
        activity.data = {
            applicationId: applicationOnline.entryId,
            source: 1,
            userId: row.userid
        };
        activity.createdAt = formatDatetimeFromVNW(row.createddate);
        activity.appliedJob();

        // Push to pull candidates
        candidates.push(row.userid);
        entryIds.push(row.entryid);
    });

    // PULL applications that sent directly
    var pullApplicationDirectlySql = sprintf(VNW_QUERIES.pullApplicationDirectly, jobId);
    var connDirect = mysqlManager.getPoolConnection();
    var rows1 = fetchVNWData(connDirect, pullApplicationDirectlySql);
    connDirect.release();
    _.each(rows1, function (row) {
        var applicationDirect = new Schemas.Application();
        applicationDirect.entryId = row.sdid;
        applicationDirect.jobId = row.jobid;
        applicationDirect.companyId = companyId;
        applicationDirect.candidateId = row.userid;
        applicationDirect.source = 2;
        applicationDirect.data = row;
        applicationDirect.createdAt = formatDatetimeFromVNW(row.createddate);
        Collections.Applications.insert(applicationDirect);

        // Log applied activity
        var activity = new Activity();
        activity.companyId = companyId;
        activity.data = {
            applicationId: applicationDirect.entryId,
            source: 2,
            userId: row.userid
        };
        activity.createdAt = formatDatetimeFromVNW(row.createddate);
        activity.appliedJob();

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
        var conn = mysqlManager.getPoolConnection();
        var rows = fetchVNWData(conn, pullCandidatesSql);
        conn.release();
        _.each(rows, function (row) {
            var can = Collections.Candidates.findOne({candidateId: row.userid});

            if (!can) {
                can = new Schemas.Candidate();
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
};


SYNC_VNW.pullApplicationScores = function (entryIds) {
    check(entryIds, Array);
    if (entryIds.length < 1) return;

    var pullApplicationScoreSql = sprintf(VNW_QUERIES.pullApplicationScores, entryIds.join(","));
    try {
        var conn = mysqlManager.getPoolConnection();
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
};


SYNC_VNW.analyticJobs = function (companyId, items) {
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
};

SYNC_VNW.analyticApplications = function (companyId, items) {
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
};

SYNC_VNW.insertVNWJob = function (jobId, companyId) {
    var pullJobSql = sprintf(VNW_QUERIES.pullJob, jobId);
    try {
        var conn = mysqlManager.getPoolConnection();
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
            job.updatedAt = formatDatetimeFromVNW(row.lastupdateddate);
            Collections.Jobs.insert(job);

            //SYNC_VNW.pullApplications(jobId, companyId);
        });

    } catch (e) {
        debuger(e)
    }
};

SYNC_VNW.updateVNWJob = function (jobId, companyId) {
    var pullJobSql = sprintf(VNW_QUERIES.pullJob, jobId);
    try {
        var conn = mysqlManager.getPoolConnection();
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
            };
            Collections.Jobs.update(criteria, modifier);
        });
    } catch (e) {
        debuger(e)
    }
};

SYNC_VNW.deleteVNWJobs = function (jobIds) {
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
        debuger(e);
    }
};

SYNC_VNW.insertVNWApplication = function (data, companyId) {
    try {
        var query = sprintf(VNW_QUERIES.pullAppOnline, data.typeId);
        if (data.source == 2) {
            query = sprintf(VNW_QUERIES.pullAppDirect, data.typeId);
        }
        var conn = mysqlManager.getPoolConnection();
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
};

SYNC_VNW.updateVNWApplication = function (data, companyId) {
    try {
        var query = sprintf(VNW_QUERIES.pullAppOnline, data.typeId);
        if (data.source == 2) {
            query = sprintf(VNW_QUERIES.pullAppDirect, data.typeId);
        }
        var conn = mysqlManager.getPoolConnection();
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
            };
            Collections.Applications.update(criteria, modifier);
        });

    } catch (e) {
        debuger(e)
    }
};

SYNC_VNW.deleteVNWApplications = function (items) {
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
};


SYNC_VNW.pullData = function (companyId, items) {
    try {
        check(items, Array);
        if (items.length <= 0) return true;
        // Check items new, updated, deleted
        var mainType = items[0].type;
        var result = {};
        switch (mainType) {
            case "job":

                result = SYNC_VNW.analyticJobs(companyId, items);
                // Insert new job
                _.each(result.added, function (jobId) {
                    SYNC_VNW.insertVNWJob(jobId, companyId);
                });
                // Update new job
                _.each(result.changed, function (jobId) {
                    SYNC_VNW.updateVNWJob(jobId, companyId);
                });
                // Delete new jobs
                SYNC_VNW.deleteVNWJobs(result.removed);

                break;

            case "application":
                result = SYNC_VNW.analyticApplications(companyId, items);
                // Insert new job
                _.each(result.added, function (app) {
                    SYNC_VNW.insertVNWApplication(app, companyId);
                });
                // Update new job
                _.each(result.changed, function (app) {
                    SYNC_VNW.updateVNWApplication(app, companyId);
                });
                // Delete new jobs
                SYNC_VNW.deleteVNWApplications(result.removed);
                break;

            case "candidate":

                break;
            default:
                return true;
        }
    } catch (e) {
        debuger(e)
    }
};

function pullCompanyData(j, cb) {
    var user = j.data;
    var userId = user.userId;
    var companyId = user.companyId;


    try {
        // GET ALL JOB IDS

        var jSql = sprintf(VNW_QUERIES.checkJobsUpdate, userId);
        var conn = mysqlManager.getPoolConnection();
        var jRows = fetchVNWData(conn, jSql);
        conn.release();

        if (jRows.length <= 0) {
            j.done();
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
    var cronData = {
        lastUpdated: new Date(),
        userId: userId,
        companyId: companyId
    };

    SYNC_VNW.addQueue('cronData', cronData);
    cb();
}

SYNC_VNW.sync = function () {
    Collections.SyncQueue.remove({type: "cronData"});
    Collections.SyncQueue.update({type: "pullCompanyData", status: "completed"}, {$set: {status: "ready", runId: null}})
};

SYNC_VNW.addQueue = function (type, data) {
    Job(Collections.SyncQueue, type, data).save();
};


Mongo.Collection.prototype.constructor = Mongo.Collection;
Collections.SyncQueue = JobCollection('vnw_sync_queue');
Collections.SyncQueue.processJobs('pullCompanyData', {concurrency: 20, payload: 1}, pullCompanyData);

Meteor.startup(function () {
    return Collections.SyncQueue.startJobServer();
});