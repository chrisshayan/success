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
    VNW_QUERIES = Meteor.settings.queries;


var fetchVNWData = Meteor.wrapAsync(function (query, callback) {
    var conn = mysqlManager.getPoolConnection();

    conn.query(query, function (err, rows, fields) {
        if (err) throw err;
        conn.release();
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
            Success.initialEmployerData(userInfo.userid, userInfo.username, userInfo.companyid);
            SYNC_VNW.pullCompanyInfo(userInfo.companyid);
            /*var jobData = {
             userId: _user.userId,
             companyId: userInfo.companyid
             };

             SYNC_VNW.addQueue('pullCompanyData', jobData);*/

            var cronData = {
                lastUpdated: null,
                userId: userInfo.userid,
                companyId: userInfo.companyid
            };

            SYNC_VNW.addQueue('cronData', cronData);
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

        var rows = fetchVNWData(pullCompanyInfoSql);

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


SYNC_VNW.pullCandidates = function (candidates) {
    check(candidates, Array);
    if (candidates.length < 1) return;

    var pullCandidatesSql = sprintf(VNW_QUERIES.pullCandidates, candidates);

    try {
        var rows = fetchVNWData(pullCandidatesSql);

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

        SYNC_VNW.migration(rows);

    } catch (e) {
        debuger(e)
    }
};


SYNC_VNW.pullApplicationScores = function (entryIds) {
    check(entryIds, Array);
    if (entryIds.length < 1) return;

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
            "vnwData.lastupdateddate": 1
        }
    }).map(function (doc) {
        return {
            type: "job",
            typeId: doc.jobId,
            updatedAt: doc.vnwData.lastupdateddate
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

SYNC_VNW.syncApplication = function (companyId, applications) {
    check(companyId, Number);
    check(applications, Array);
    var mongoApps = Collections.Applications.find({companyId: companyId}).fetch();

    applications.forEach(function (app) {
        var query = {entryId: app.typeId};
        var indexApp = _.findKey(mongoApps, query);

        if (indexApp >= 0) {
            if (mongoApps[indexApp].isDeleted === app.isDeleted)
                return;
            var modifier = {
                'isDeleted': app.isDeleted
            };
            console.log('update: ', app.typeId);

            Collections.Applications.update(query, {
                '$set': modifier
            })

        } else if (!app.isDeleted) {
            console.log('insert');
            SYNC_VNW.insertVNWApplication(app, companyId);

            Meteor.defer(function () {
                if (app.source === 1) {
                    app.resumeId && SYNC_VNW.syncResume(app.resumeId);
                }
            });
        }

    });
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
            "createdAt": 1
        }
    }).map(function (doc) {
        return {
            type: "application",
            typeId: doc.entryId
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

        var rows = fetchVNWData(pullJobSql);

        _.each(rows, function (row) {
            var expiredAt = formatDatetimeFromVNW(row.expireddate);
            var job = {
                companyId: companyId,
                jobId: row.jobid,
                userId: row.userid,
                source: 'vnw',
                title: row.jobtitle,
                level: '',
                categories: [],
                locations: [],
                salaryMin: row.salarymin,
                salaryMax: row.salarymax,
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
        var rows = fetchVNWData(pullJobSql);

        _.each(rows, function (row) {
            var criteria = {
                jobId: jobId
            };
            var expiredAt = formatDatetimeFromVNW(row.expireddate);

            var updateData = {
                title: row.jobtitle,
                level: '',
                categories: [],
                locations: [],
                salaryMin: row.salarymin,
                salaryMax: row.salarymax,
                showSalary: true,
                description: row.jobdescription,
                requirements: row.skillexperience,
                benifits: '',
                recruiterEmails: _.unique(row.emailaddress.toLowerCase().match(/[A-Za-z\.0-9_]+@[a-zA-Z\.0-9_]+/g)),
                skills: [],
                vnwData: row,
                createdAt: formatDatetimeFromVNW(row.createddate),
                updatedAt: formatDatetimeFromVNW(row.lastupdateddate),
                expiredAt: expiredAt
            };


            if (!row.isactive)
                updateData.status = 2;
            else if (moment(expiredAt).valueOf() < Date.now())
                updateData.status = 0;
            else
                updateData.status = 1;


            var modifier = {
                $set: updateData
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
            source: null,
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
        var rows = fetchVNWData(query);

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
            app.isDeleted = data.isDeleted;
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

        });

        var candidateLists = _.pluck(rows, 'userid');
        candidateLists.length && SYNC_VNW.pullCandidates(candidateLists);

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

        var rows = fetchVNWData(query);
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
            source: {
                $ne: 3
            },
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
                console.log('sync app');

                SYNC_VNW.syncApplication(companyId, items);

                /*result = SYNC_VNW.analyticApplications(companyId, items);
                 // Insert new job
                 _.each(result.added, function (app) {
                 SYNC_VNW.insertVNWApplication(app, companyId);
                 });
                 // Update new job
                 _.each(result.changed, function (app) {
                 SYNC_VNW.updateVNWApplication(app, companyId);
                 });
                 // Delete new jobs
                 SYNC_VNW.deleteVNWApplications(result.removed);*/
                break;


            case "candidate":

                break;
            default:
                return true;
        }
    } catch (e) {
        debuger(e)
    }

    //SYNC_VNW.migration();
};


SYNC_VNW.syncResume = function (resumeId) {
    var generalQuery = sprintf(VNW_QUERIES.general, resumeId);
    var resumeRows = fetchVNWData(generalQuery);

    _.each(resumeRows, function (row) {
        var resume = Collections.Resumes.findOne({resumeId: resumeId});
        var formatLastUpdated = formatDatetimeFromVNW(row.lastdateupdated);

        if (!resume || parseTimeToString(formatLastUpdated) != parseTimeToString(resume.updatedAt)) {
            if (resume)
                Collections.Resumes.remove({resumeId: resumeId});

            resume = new Schemas.resume();

            resume.resumeId = resumeId;
            resume.resumeTitle = row.resumetitle;
            resume.userId = row.userid;
            resume.fullName = row.fullname;
            resume.highestDegreeId = row.highestdegreeid;
            resume.mostRecentPosition = row.mostrecentposition;
            resume.mostRecentEmployer = row.mostrecentemployer;
            resume.yearOfExperience = row.yearsexperienceid || 0;
            resume.suggestedSalary = row.suggestedsalary;
            resume.careerObjective = row.jobdescription;
            resume.address = row.address;
            resume.emailAddress = row.emailaddress;
            resume.desireJobTitle = row.desiredjobtitle;
            resume.cellphone = row.cellphone;
            resume.updatedAt = formatLastUpdated;
            resume.data = row;
            resume.createdAt = formatDatetimeFromVNW(row.createddate);

            // get Education
            var educationQuery = sprintf(VNW_QUERIES.education, resumeId);

            var educationRows = fetchVNWData(educationQuery);

            _.each(educationRows, function (row) {
                resume.education.push({
                    highestDegreeId: row.highestdegreeid,
                    schoolName: row.schoolname,
                    major: row.major,
                    startDate: row.startdate,
                    endDate: row.enddate,
                    description: row.description,
                    educationOrder: row.educationorder
                });
            });

            var experienceQuery = sprintf(VNW_QUERIES.experience, resumeId);

            var experienceRows = fetchVNWData(experienceQuery);

            _.each(experienceRows, function (row) {
                resume.experience.push({
                    jobTitle: row.jobtitle,
                    companyName: row.companyname,
                    startDate: row.startdate,
                    endDate: row.enddate,
                    description: row.description,
                    experienceOrder: row.experienceorder,
                    isCurrent: row.iscurrent

                })
            });

            var referenceQuery = sprintf(VNW_QUERIES.reference, resumeId);
            var referenceRows = fetchVNWData(referenceQuery);

            _.each(referenceRows, function (row) {
                resume.reference.push({
                    name: row.name,
                    title: row.title,
                    companyName: row.companyname,
                    phone: row.phone,
                    email: row.email,
                    description: row.description,
                    referenceType: row.referencetype,
                    referenceOrder: row.referenceorther,
                    isAvailable: row.isavailable
                })
            });
            Collections.Resumes.insert(resume);

        }
    });
}


function pullCompanyData(j, cb) {
    var user = j.data;
    var userId = user.userId;
    var companyId = user.companyId;

    var cronData = {
        lastUpdated: new Date(),
        userId: userId,
        companyId: companyId
    };

    console.log('pulling from user : ', userId);
    try {
        // GET ALL JOB IDS
        // GET ALL JOB IDS

        var jSql = sprintf(VNW_QUERIES.checkJobsUpdate, userId);

        var jRows = fetchVNWData(jSql);

        if (jRows.length <= 0) {
            console.log('create cron');
            SYNC_VNW.addQueue('cronData', cronData);
            j.done();
            return true;
        }
        SYNC_VNW.pullData(companyId, jRows);
        var jobIds = _.pluck(jRows, 'typeId');
        if (jobIds.length > 0) {
            while (jobIds.length > 0) {
                var chunk = jobIds.splice(0, 5);
                var appSql = sprintf(VNW_QUERIES.checkApplicationsUpdate, chunk, chunk);

                var appRows = fetchVNWData(appSql);
                if (appRows.length > 0) {
                    // Sync applications
                    SYNC_VNW.pullData(companyId, appRows);
                }
            }

        }
        var jobQuery = {companyId: companyId};
        var options = {'sort': {updatedAt: -1}, 'limit': 1};

        var lastJob = Collections.Jobs.find(jobQuery, options).fetch();

        if (lastJob && lastJob.length)
            cronData.lastUpdated = lastJob[0].updatedAt;

        console.log('create cron: ', cronData);
        SYNC_VNW.addQueue('cronData', cronData);

        j.done();
    } catch (e) {
        j.fail(e);
        debuger(e);
    }

    cb();
}


SYNC_VNW.sync = function () {

    var isSkill = Collections.SyncQueue.findOne({type: "cronSkills"});
    if (!isSkill) {
        SYNC_VNW.addQueue('cronSkills', {});
    }

    /* // No need to run at firsttime.
     Collections.SyncQueue.remove({type: "cronData"});
     Collections.SyncQueue.remove({type: "pullCompanyData"});

     Collections.Users.find({}).map(function (user) {
     var cronData = {
     lastUpdated: null,
     userId: user.userId,
     companyId: user.companyId
     };

     SYNC_VNW.addQueue('cronData', cronData);
     });
     */

    // restart the cronData.


    /*
     Collections.SyncQueue.find({type: "cronClosedJob"}).map(function (job) {
     Collections.SyncQueue.update({_id: job._id}, {$set: {status: "ready", runId: null, logs: []}});
     });

     Collections.SyncQueue.find({type: "cronData"}).map(function (job) {
     Collections.SyncQueue.update({_id: job._id}, {$set: {status: "ready", runId: null}});
     });

     Collections.SyncQueue.find({type: "pullCompanyData", status: {$in: ['running', 'fail']}}).map(function (job) {
     Collections.SyncQueue.update({_id: job._id}, {$set: {status: "ready", runId: null}});
     });*/
};

SYNC_VNW.addQueue = function (type, data) {
    Job(Collections.SyncQueue, type, data).save();
};


/*Mongo.Collection.prototype.constructor = Mongo.Collection;

 Collections.SyncQueue = JobCollection('vnw_sync_queue');

 Collections.SyncQueue.allow({
 admin: function(userId) {
 console.log('check permisson:', userId);
 return !!Meteor.users.find({_id: userId}).count();
 }
 });
 Collections.SyncQueue.processJobs('pullCompanyData', {concurrency: 20, payload: 1}, pullCompanyData);


 Collections.SyncQueue.allow({
 admin: function(userId) {
 console.log('check permisson:', userId);
 return !!Meteor.users.find({_id: userId}).count();
 }
 });*/

Meteor.startup(function () {
    return Collections.SyncQueue.startJobServer();
});