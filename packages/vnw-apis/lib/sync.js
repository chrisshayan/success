/**
 * Created by HungNguyen on 9/28/15.
 */


CRON_VNW = {};
var _ = lodash;

var VNW_QUERIES = Meteor.settings.cronQueries;


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


var fetchVNWData = Meteor.wrapAsync(function (query, callback) {
    var conn = mysqlManager.getPoolConnection();

    conn.query(query, function (err, rows, fields) {
        if (err) throw err;
        conn.release();
        callback(err, rows);
    });
});


function syncCompany(userId) {

}


function syncJob(companyId, userId) {
    try {
        //get all jobs
        var jSql = sprintf(VNW_QUERIES.pullJobIdFromUser, userId);
        console.log('job query : ', jSql);
        var jobFromSQL = fetchVNWData(jSql);

        /*var existJobs = Collections.Jobs.find(
         {
         companyId: 751
         }, {
         fields: {
         jobId: 1
         }
         }).map(function (job) {
         return job.jobId;
         });*/

        if (!jobFromSQL.length) return;


        jobFromSQL.forEach(function (job) {
            var jobId = job.jobId;
            var current = Collections.Jobs.findOne({jobId: jobId});
            if (!current) {
                processJob('save', jobId, companyId);

            } else if (current.updatedAt != formatDatetimeFromVNW(job.updatedAt)) {
                processJob('update', jobId, companyId);
            }

            syncApplication(jobId, companyId);

        });


        /*if (currentJobs.length) {
         while (currentJobs.length > 0) {
         var chunk = currentJobs.splice(0, 5);

         var jobIds = _.pluck(chunk, 'typeId');

         console.log('chunk: ', jobIds);

         // - Check new applicatiocn of this job if available.
         // - Then insert / update / remove

         var appSql = sprintf(VNW_QUERIES.cronApplicationsUpdate, jobIds, jobIds);
         //console.log('appSql', appSql);

         var appRows = fetchVNWData(appSql);

         if (appRows.length) {
         var candidates = _.pluck(appRows, 'candidateId');
         processCandidates(candidates);

         cronApps(appRows, companyId);
         }

         var jobQuery = {companyId: companyId};

         var options = {'sort': {updatedAt: -1}, 'limit': 1};
         var lastJob = Collections.Jobs.find(jobQuery, options).fetch();


         if (lastJob && lastJob.length) {
         Collections.SyncQueue.update({_id: j.doc._id}, {
         '$set': {
         'data.lastUpdated': lastJob[0].updatedAt
         }
         });
         }
         }

         }*/

    }
    catch
        (e) {
        throw e;
    }
}

function syncDegree() {
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

}


function syncApplication(jobId, companyId) {
    var aQuery = sprintf(VNW_QUERIES.cronApplicationsUpdate, jobId, jobId);
    console.log('application query : ', aQuery);
    var applicationFromSQL = fetchVNWData(aQuery);

    if (!applicationFromSQL.length) return;

    var candidates = _.pluck(applicationFromSQL, 'candidateId');
    syncCandidate(candidates);

    var groupedApp = _.groupBy(applicationFromSQL, 'source');
    //console.log('online : %s, direct : %s', groupedApp['1'], groupedApp['2']);

    if (groupedApp['1']) {
        var onlineIds = _.pluck(groupedApp['1'], 'typeId').join(',');
        syncApplicationOnline(onlineIds);

    }

    if (groupedApp['2']) {
        var directIds = _.pluck(groupedApp['2'], 'typeId').join(',');
        syncApplicationDirect(directIds)
    }

}

function syncCandidate(candidateList) {
    var getCandidatesSQL = sprintf(VNW_QUERIES.getCandiatesInfo, candidateList);
    var candidateRows = fetchVNWData(getCandidatesSQL);

    candidateRows.forEach(function (row) {
        var candidate = Collections.Candidates.findOne({candidateId: row.userid});
        if (!candidate) {
            console.log('new candidate: ', row.userid);
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


function syncApplicationOnline(ids) {
    var appOnlineSQL = sprintf(VNW_QUERIES.pullAllAppsOnline, ids);
    //console.log('appOnline', appOnlineSQL);
    var appOnlineRows = fetchVNWData(appOnlineSQL);
    if (appOnlineRows.length > 0) {

        processApp(appOnlineRows, companyId, 1);
        var resumeIds = _.pluck(appOnlineRows, 'resumeid');

        Meteor.defer(function () {
            syncResumes(resumeIds);
        });
    }

}

function syncApplicationDirect(ids) {
    var appDirectSQL = sprintf(VNW_QUERIES.pullAllAppsDirect, ids);

    var appDirectRows = fetchVNWData(appDirectSQL);

    if (appDirectRows.length > 0) {
        processApp(appDirectRows, companyId, 2);
    }

}

function syncResumes(resumeIds) {
    if (resumeIds == void 0 || !resumeIds.length) return;

    resumeIds.forEach(function (resumeId) {

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
    })

}

function syncCity() {
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
}


function syncSkill() {
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
    } catch (e) {
        console.log(e);
    }

}

CRON_VNW.startupSync = function () {
    Meteor.defer(function () {
        syncDegree();
        //syncSkill();
    });

    var users = Meteor.users.find({}, {fields: {vnwId: 1, companyId: 1}}).fetch();
    users && users.forEach(function (user) {
        console.log('user: ', user);
        syncJob(user.vnwId, user.userId);
    })
};

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
        cJobs.forEach(function (row) {
            var query = {
                jobId: item.typeId
            };

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

            // update
            if (mongoJob
                && (parseTimeToString(mongoJob.createdAt) !== parseTimeToString(job.createdAt)
                || parseTimeToString(mongoJob.updatedAt) !== parseTimeToString(job.updatedAt))) {
                console.log('update Job :', job.jobId);

                console.log('previous info create : %s, update :%s', mongoJob.createdAt, mongoJob.updatedAt);
                console.log('new info create : %s, update :%s', job.createdAt, job.updatedAt);
                var modifier = {
                    '$set': job
                };
                Collections.Jobs.update(query, modifier);

                // add new
            } else if (!mongoJob) {
                console.log('create Job :', job.jobId);
                Collections.Jobs.insert(job);

            }
        });
    }
}


function processApp(appRows, companyId, sourceId) {
    var mongoApps = Collections.Applications.find({companyId: companyId}).fetch();

    var filter = {
        fields: {
            candidateId: 1,
            'data.firstname': 1,
            'data.lastname': 1
        }
    };

    appRows.forEach(function (row) {
        var appId = row.entryid || row.sdid;

        var query = {entryId: appId};
        var indexApp = _.findKey(mongoApps, query);

        if (indexApp >= 0) {
            if (mongoApps[indexApp].isDeleted === row['deleted_by_employer'])
                return;
            console.log('update application: ', appId);
            var modifier = {
                'isDeleted': row['deleted_by_employer']
            };

            Collections.Applications.update(query, {
                '$set': modifier
            })

        } else if (!row['deleted_by_employer']) {

            var application = new Schemas.Application();
            application.entryId = appId;
            application.companyId = companyId;
            application.jobId = row.jobid;
            application.candidateId = row.userid;
            application.source = sourceId;
            application.isDeleted = row['deleted_by_employer'];
            application.data = row;
            application.createdAt = formatDatetimeFromVNW(row.createddate);
            application.matchingScore = row.matchingScore;


            var can = Collections.Candidates.findOne({candidateId: row.userid});

            if (can) {
                var candidateInfo = {
                    "firstName": can.data.firstname || can.data.firstName || '',
                    "lastName": can.data.lastname || can.data.lastName || '',
                    "emails": [
                        can.data.username, can.data.email, can.data.email1, can.data.email2
                    ]
                };

                candidateInfo.fullname = [candidateInfo.lastName, candidateInfo.firstName].join(' ');
                candidateInfo.emails = _.without(candidateInfo.emails, null, undefined, '');

                application.candidateInfo = candidateInfo;
            }
            console.log('insert application:', application.entryId);

            if (sourceId == '1')
                application.resumeId = row.resumeid;

            Collections.Applications.insert(application);

            /* Log activity */
            Meteor.defer(function () {
                // Log applied activity
                var activity = new Activity();
                activity.companyId = companyId;
                activity.data = {
                    applicationId: appId,
                    source: sourceId,
                    userId: row.userid
                };
                activity.createdAt = formatDatetimeFromVNW(row.createddate);
                activity.appliedJob();

            });

        }
    });

    /*    var candidateLists = _.pluck(appRows, 'userid');

     Meteor.defer(function () {
     candidateLists.length && processCandidates(candidateLists);
     });*/
}
