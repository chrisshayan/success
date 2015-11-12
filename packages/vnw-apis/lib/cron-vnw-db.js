/**
 * Created by HungNguyen on 8/5/15.
 */

CRON_VNW = {};
var _ = lodash;

function formatDatetimeFromVNW(datetime) {
    if (datetime == void 0) return false;

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
    if (date == void 0)
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


CRON_VNW.getJobTags = function (jobId) {
    if (jobId == void 0 || typeof jobId === 'string') return [];

    var getTagByJobSql = sprintf(VNW_QUERIES.getJobTags, jobId);
    var tagRows = fetchVNWData(getTagByJobSql);

    Meteor.defer(function () {
        //skillid, skillName
        tagRows.forEach(function (tag) {
            var skill = new Schemas.skill();

            skill.skillId = tag.skillId;
            skill.skillName = (tag.skillName) ? tag.skillName.trim().toLowerCase() : '';
            skill.skillLength = tag.skillName.length;

            Collections.SkillTerms.upsert({skillId: tag.skillId},
                {'$set': skill}
            );
        });
    });

    var tags = _.pluck(tagRows, 'skillName');

    // console.log('skill tags : ', tags);

    return tags;

};

CRON_VNW.getBenefits = function (jobId) {
    if (jobId == void 0 || typeof jobId === 'string') return '';

    var getBenefitByJobSql = sprintf(VNW_QUERIES.getBenefits, jobId);
    //   console.log('jid', jobId);
    var benefitRows = fetchVNWData(getBenefitByJobSql);
    var list = _.pluck(benefitRows, 'benefitValue');
    //   console.log('benefits : ', list);
    var benefits = list.join('\n');

    return benefits;

};


CRON_VNW.getLocations = function (jobId) {
    if (jobId == void 0 || typeof jobId === 'string') return '';

    var locationByJobIdQuery = sprintf(VNW_QUERIES.getLocations, jobId);
    //   console.log('jid', jobId);
    var locationRows = fetchVNWData(locationByJobIdQuery);
    var list = _.pluck(locationRows, 'cityid');
    //   console.log('benefits : ', list);
    var cities = Meteor.cities.find({languageId: 2, vnwId: {$in: list}}).fetch();
    cities = _.pluck(cities, '_id');

    return cities;

};


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

CRON_VNWddQueueCron = function (type, data) {
    Job(Collections.SyncQueue, type, data).save();
};


CRON_VNW.setupHiringTeamOnwerInfo = function (data) {
    var user = Meteor.users.findOne({vnwId: data.userId});

    var email = user.emails[0].address;

    var hiringTeamItem = new HiringTeam();
    if (Meteor['hiringTeam'].findOne({companyId: data.companyId, email: email}))
        return {
            status: 0,
            message: 'This email address is exist in your hiring team already'
        };

    hiringTeamItem.companyId = data.companyId;
    hiringTeamItem.email = email;
    hiringTeamItem.username = 'admin' + user.companyId;
    hiringTeamItem.roleId = 'admin';
    hiringTeamItem.status = 1;
    hiringTeamItem.name = [user.profile.firstname, user.profile.lastname].join(' ').trim();

    if (!hiringTeamItem.name.length)
        hiringTeamItem.name = 'admin';

    //hiringTeamItem.roleId = [];
    hiringTeamItem.save();
};


function cronData(j, cb) {
    var data = j.data;
    if (data.companyId == void 0 || data.userId == void 0)
        j.done();

    else {

        var userId = data.userId
            , companyId = data.companyId;

        /*if (info.lastUpdated != void 0)
         lastUpdatedObj = moment(info.lastUpdated);*/


        //get latest syncTime

        try {

            CRON_VNW.setupHiringTeamOnwerInfo(data);

            //get all jobs
            var jSql = sprintf(VNW_QUERIES.pullJobIdFromUser, userId);
            //console.log('jsql : ', jSql);
            var updateJobs = fetchVNWData(jSql);
            //console.log('all job :', updateJobs.length);

            var onlineJob = _.filter(updateJobs, function (job) {
                return moment(job.expiredAt) > moment().subtract(1, 'day');
            });

            //console.log('onlinejob : ', onlineJob.length);
            processJob(onlineJob, companyId);


            var closedJobIds = _.difference(updateJobs, onlineJob);

            var closedJobData = {
                userId: userId,
                companyId: companyId,
                closedJobIds: closedJobIds
            };

            CRON_VNW.addQueueCron('cronClosedJob', closedJobData);

            //console.log('onlinejob of %s company is done', companyId);

            /*updateJobs.forEach(function (job) {
             if (moment(job.expiredAt) > moment().subtract(1, 'day')) {
             processJob(job, companyId);
             }
             /!*if (moment(job.createdAt) > lastUpdatedObj || moment(job.updatedAt) > lastUpdatedObj) {

             }*!/
             });*/


            j.done();

        }
        catch
            (e) {
            j.fail();
            throw e;
        }
    }

    cb();
}

function cronClosedJob(jb, cb) {
    var info = jb.data;
    if (info.companyId == void 0 || info.userId == void 0 || info.closedJobIds == void 0)
        jb.done();

    else {
        try {
            //console.log('company : %s closeJob: ', info.companyId, info.closedJobIds.length);
            //console.log(info.closedJobIds);
            processJob(info.closedJobIds, info.companyId);
            console.log('done');
            jb.done();
            console.log('closedJob of company %s is done', info.companyId);

        } catch (e) {
            console.log('closedJob error');
            console.trace(e);
            jb.fail();
        }
    }
    cb();
}


function processJob(items, companyId) {
    items.forEach(function (item) {
        try {
            //remove
            /*if (mongoJob && item.isdeleted) {
             Collections.Jobs.remove({jobId: item.jobId});
             console.log("processJob")
             } else {*/
            var getJobQuery = sprintf(VNW_QUERIES.pullJob, item.jobId);
            var cJobs = fetchVNWData(getJobQuery);
            //console.log('jobs', cJobs.length);
            cJobs.forEach(function (row) {

                /*var job = {
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
                 };*/

                /*var job = Meteor['jobs'].findOne({'source.jobId': item.jobId});
                 if (!job)*/
                var job = new vnwJob();

                var expiredAt = formatDatetimeFromVNW(row.expireddate);
                var createdAt = formatDatetimeFromVNW(row.createddate);
                var updatedAt = formatDatetimeFromVNW(row.lastupdateddate);
                job.companyId = +companyId;
                //job.jobId = +row.jobid;
                job.userId = +row.userid;
                /*job.source = 1;
                 job.sourceId = +row.jobid;*/
                job.source = {
                    type: 1, // 1 : vnw  , 2 : success
                    jobId: +row.jobid
                };
                job.title = row.jobtitle;
                job.level = '';
                //job.categories = [];
                job.salaryMin = +row.salarymin;
                job.salaryMax = +row.salarymax;
                job.showSalary = true;
                job.description = row.jobdescription;
                job.requirements = row.skillexperience;
                job.benefits = '';
                job.recruiterEmails = _.unique(row.emailaddress.toLowerCase().match(/[A-Za-z\.0-9_]+@[a-zA-Z\.0-9_]+/g));
                job.skills = [];
                //job.vnwData = EJSON.parse(EJSON.stringify(row));
                job.status = (moment(expiredAt).valueOf() < Date.now()) ? 0 : 1;
                job.createdAt = createdAt;
                job.updatedAt = updatedAt;
                job.expiredAt = expiredAt;


                if (!row.isactive)
                    job.status = 2;
                else if (moment(expiredAt).valueOf() < Date.now())
                    job.status = 0;
                else
                    job.status = 1;

                // update

                //var mongoJob = Meteor['jobs'].findOne({jobId: item.jobId});
                var existJob = job.isExist();
                /*console.log('existJob: ', !!existJob);
                 console.log('isupdate: ', (!existJob));*/
                if (!existJob) {

                    job.skills = CRON_VNW.getJobTags(+row.jobid);
                    job.benefits = CRON_VNW.getBenefits(+row.jobid);
                    job.locations = CRON_VNW.getLocations(+row.jobid);

                    /*var modifier = {
                     '$set': job
                     };*/
                    //console.log('job insert ', row.jobid);
                    job.save();
                    //console.log(Meteor.jobs.findOne());
                    //Collections.Jobs.update(query, modifier);
                    //console.log('job insert complete', row.jobid);
                    // add new
                } else if (parseTimeToString(existJob.createdAt) !== parseTimeToString(job.createdAt)
                    || parseTimeToString(existJob.updatedAt) !== parseTimeToString(job.updatedAt)) {
                    //console.log('update');
                    existJob.skills = CRON_VNW.getJobTags(+row.jobid);
                    existJob.benefits = CRON_VNW.getBenefits(+row.jobid);
                    existJob.locations = CRON_VNW.getLocations(+row.jobid);
                    existJob.createdAt = job.createdAt;
                    existJob.updatedAt = job.updatedAt;

                    existJob.save();
                }
                //console.log('cjob', cJobs);
                /*else {

                 //console.log('func ', job.save.toString());
                 job.skills = CRON_VNW.getJobTags(+row.jobid);
                 job.benefits = CRON_VNW.getBenefits(+row.jobid);
                 job.locations = CRON_VNW.getLocations(+row.jobid);
                 job.save();
                 //Collections.Jobs.insert(job);

                 }*/
            });
        } catch (e) {
            console.log('err');
            console.trace(e);
        }
    });

    processAfterSyncJob(items, companyId);
    //}
}


function processAfterSyncJob(jobs, companyId) {
    try {
        if (jobs.length) {
            while (jobs.length > 0) {
                var chunk = jobs.splice(0, 5);

                var jobIds = _.pluck(chunk, 'jobId');

                //console.log('chunk: ', jobIds);
                _.remove(jobIds, function (jId) {
                    return jId === '' || jId == void 0
                });
                // - Check new applicatiocn of this job if available.
                // - Then insert / update / remove

                if (typeof jobIds !== 'object' || jobIds.length == 0)
                    return;

                var appSql = sprintf(VNW_QUERIES.cronApplicationsUpdate, jobIds, jobIds);
                //console.log('appSql', appSql);

                var appRows = fetchVNWData(appSql);
                //console.log(appRows.length);

                if (appRows.length) {
                    var candidates = _.pluck(appRows, 'candidateId');
                    processCandidates(candidates);

                    cronApps(appRows, companyId);
                }

            }
        }
    } catch (e) {
        console.log('sync application error');
        console.trace(e);
    }
}


function processApp(appRows, companyId, sourceId) {
    try {
        var mongoApps = companyId ? Meteor.applications.find({companyId: companyId}).fetch() : [];

        /*var filter = {
         fields: {
         candidateId: 1,
         'data.firstname': 1,
         'data.lastname': 1
         }
         };*/

        appRows.forEach(function (row) {
            var appId = row.entryid || row.sdid;

            var query = {'source.appId': appId};

            var application = Meteor.applications.findOne(query);
            if (application == void 0) {
                application = new Application();

                if (row['deleted_by_employer'])
                    return;
            }

            if (application.isDeleted === row['deleted_by_employer'])
                return;

            application.entryId = +appId;
            application.companyId = +companyId;
            //application.jobId = +row.jobid;

            application.source = {
                type: +sourceId,
                appId: +appId,
                jobId: +row.jobid,
                candidateId: +row.userid
            };

            application.coverLetter = row.coverletter || '';
            application.isDeleted = row['deleted_by_employer'];
            application.data = row;
            application.createdAt = formatDatetimeFromVNW(row.createddate);
            application.matchingScore = row.matchingScore || 0;


            var can = Meteor.candidates.findOne({candidateId: row.userid});


            if (can) {
                var candidateInfo = {
                    "firstName": can.firstname || '',
                    "lastName": can.lastname || '',
                    "emails": [
                        can.username, can.email, can.email1, can.email2
                    ]
                };

                candidateInfo.fullname = [candidateInfo.lastName, candidateInfo.firstName].join(' ');
                candidateInfo.emails = _.without(candidateInfo.emails, null, undefined, '');

                application.candidateInfo = candidateInfo;


                application.candidateId = can._id;

            } else {
                console.log('missing candidateId : ', row.userid);

            }
            //console.log('insert application:', application.entryId);

            if (sourceId == '1')
                application.resumeId = row.resumeid;

            //var aId = Meteor.applications.insert(application);

            application.save();


            /* Log activity */
            /*Meteor.defer(function () {
                // Log applied activity
                var activity = new Activity();
                activity.companyId = companyId;
                activity.data = {
                    applicationId: application._id,
                    source: sourceId,
                    userId: (can ) ? can._id : row.userid || ''

                };
                activity.createdAt = formatDatetimeFromVNW(row.createddate);
                activity.appliedJob();

            });*/

        });

        /*    var candidateLists = _.pluck(appRows, 'userid');

         Meteor.defer(function () {
         candidateLists.length && processCandidates(candidateLists);
         });*/
    } catch (e) {
        console.log('process application error');
        console.trace(e);
    }
}

function processCandidates(candidateList) {
    try {
        var getCandidatesSQL = sprintf(VNW_QUERIES.getCandiatesInfo, candidateList);
        var candidateRows = fetchVNWData(getCandidatesSQL);

        candidateRows.forEach(function (row) {
            var candidate = Meteor.candidates.findOne({candidateId: row.userid});
            if (!candidate) {
                //console.log('new candidate: ', row.userid);
                //console.log('new', row.userid, row.firstname);
                //candidate = new Schemas.Candidate();
                //candidate.candidateId = row.userid;
                //candidate.data = row;
                //candidate.createdAt = formatDatetimeFromVNW(row.createddate);
                //Collections.Candidates.insert(candidate);
                candidate = new Candidate();

            }

            candidate.candidateId = row.userid;
            candidate.username = row.username;
            candidate.password = row.userpass;
            candidate.source = {
                type: 1,
                candidateId: row.userid
            };
            candidate.firstname = row.firstname;
            candidate.lastname = row.lastname;
            candidate.email = row.email;
            candidate.email1 = row.email1;
            candidate.email2 = row.email2;
            candidate.genderId = row.genderid;
            candidate.jobTitle = row.jobtitle;
            candidate.workingCompany = row.workingCompanyName;

            //candidate.data = job.vnwData = EJSON.parse(EJSON.stringify(row));;
            //candidate.vnwData = job.vnwData = EJSON.parse(EJSON.stringify(row));;
            //console.log(candidate);

            //console.log('date', row);
            var updatedDate = formatDatetimeFromVNW(row.lastdateupdated);

            if (parseTimeToString(candidate.updatedAt) != parseTimeToString(updatedDate)) {
                candidate.createdAt = formatDatetimeFromVNW(row.createddate);
                candidate.updatedAt = updatedDate || candidate.createdAt;
                //console.log('save candidate');
                //TODO : in the future, the 3rd job will care this one
                //console.log(candidate);
                candidate.save();
            }


            /*    if (!_.isEqual(candidate.data, row)) {
             Collections.Candidates.update(candidate._id, {
             $set: {
             data: row,
             lastSyncedAt: new Date()
             }
             });
             }*/

        })
    } catch (e) {
        console.log('candidate error');
        console.trace(e);
    }
}


function cronApps(appRows, companyId) {
    //   console.log('start cron app');
    //appRows.source 1 : online, appRows.source 2 : direct
    var groupedApp = _.groupBy(appRows, 'source');
    //console.log('online : %s, direct : %s', groupedApp['1'], groupedApp['2']);

    if (groupedApp['1']) {
        var appOnlineSQL = sprintf(VNW_QUERIES.pullAllAppsOnline, _.pluck(groupedApp['1'], 'typeId').join(','));
        //console.log('appOnline', appOnlineSQL);
        var appOnlineRows = fetchVNWData(appOnlineSQL);
        if (appOnlineRows.length > 0) {
            processApp(appOnlineRows, companyId, 1);
            var resumeIds = _.pluck(appOnlineRows, 'resumeid');

            Meteor.defer(function () {
                CRON_VNW.cronResume(resumeIds);
            });
        }
    }

    if (groupedApp['2']) {
        var appDirectSQL = sprintf(VNW_QUERIES.pullAllAppsDirect, _.pluck(groupedApp['2'], 'typeId').join(','));
        //console.log('appDirect', appDirectSQL);
        var appDirectRows = fetchVNWData(appDirectSQL);

        if (appDirectRows.length > 0) {
            processApp(appDirectRows, companyId, 2);
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


CRON_VNW.cronResume = function (resumeIds) {
    if (resumeIds == void 0 || !resumeIds.length) return false;

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


CRON_VNW.integration = function () {
    // integration go here;
    //var directApplication = Meteor.applications.find({source: 1, 'data.resumeid': {'$exists': false}}, {
    //    fields: {source: 1}
    //}).fetch();
    //var directIds = _.pluck(directApplication, '_id');
    //
    //Meteor.applications.update({_id: {$in: directIds}}, {
    //    '$set': {
    //        source: 2
    //    }
    //}, {multi: true});
    //
    //var resumeIds = [];
    //
    //Meteor.applications.find({'data.resumeid': {'$exists': true}}).map(function (application) {
    //    Meteor.applications.update({_id: application._id},
    //        {
    //            '$set': {
    //                'resumeId': application.data.resumeid
    //            }
    //        });
    //
    //    resumeIds.push(application.data.resumeid);
    //});
    //
    //CRON_VNW.cronResume(resumeIds);
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
                    skill.skillName = row.skillName.trim().toLowerCase();
                    skill.skillLength = row.skillName.length;
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


var cronApplications = function () {
    var lastOnlineAppliation = Meteor.applications.findOne({source: 1}, {
        fields: {candidateId: 1},
        sort: {candidateId: -1}
    });

    var newOnlineAppQuery = sprintf(VNW_QUERIES.pullNewOnlineApplications, lastOnlineAppliation);

    var newOnlineAppRows = fetchVNWData(newOnlineAppQuery);


    if (newOnlineAppRows.length) {
        var candidates = _.pluck(newOnlineAppRows, 'candidateId');
        processCandidates(candidates);

        processApp(newOnlineAppRows, null, 1);

        var resumeIds = _.pluck(newOnlineAppRows, 'resumeid');

        Meteor.defer(function () {
            CRON_VNW.cronResume(resumeIds);
        });

    }


    var lastDirectAppliation = Meteor.applications.findOne({source: 2}, {
        fields: {candidateId: 1},
        sort: {candidateId: -1}
    });

    var newDirectAppQuery = sprintf(VNW_QUERIES.pullNewDirectApplications, lastDirectAppliation);

    var newDirectAppRows = fetchVNWData(newDirectAppQuery);

    if (newDirectAppRows) {
        var resumeIds = _.pluck(newOnlineAppRows, 'resumeid');

        Meteor.defer(function () {
            CRON_VNW.cronResume(resumeIds);
        });

        processApp(newDirectAppRows, null, 2);
    }


};

CRON_VNW.sync = function () {
    // remove old sync job
    Collections.SyncQueue.remove({type: {$in: ['cronData', 'cronClosedJob']}});

    // add new sync job
    Meteor.users.find().map(function (user) {

        var data = {
            userId: user.vnwId,
            companyId: user.companyId
        };

        if (data.companyId == void 0 || data.userId == void 0) return false;

        CRON_VNW.addQueueCron('cronData', data)
    });
};

CRON_VNW.addQueueCron = function (type, data) {
    Job(Collections.SyncQueue, type, data).save();
};


Mongo.Collection.prototype.constructor = Mongo.Collection;
Collections.SyncQueue = JobCollection('vnw_sync_queue');


Collections.SyncQueue.allow({
    admin: function (userId) {
        //    console.log('check permisson:', userId);
        return !!Meteor.users.find({_id: userId}).count();
    }
});


Collections.SyncQueue.processJobs('cronData', {concurrency: 20, payload: 1}, cronData);
Collections.SyncQueue.processJobs('cronClosedJob', {concurrency: 20, payload: 1}, cronClosedJob);
Collections.SyncQueue.processJobs('cronSkills', {concurrency: 20, payload: 1}, cronSkills);
