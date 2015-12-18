ESSearch = Meteor.wrapAsync(function (query, cb) {
    ES.search(query).then(function (body) {
        cb(null, body)
    }, function (error) {
        cb(error, {});
    });
});

var pubs = {};
const citiesCache = Meteor.cities.find({languageId: 2}, {fields: {name: 1, vnwId: 1}}).fetch();

pubs.ESJobs = function (type, limit, q) {
    if (!this.userId) return this.ready();
    this.unblock();

    const user = Meteor.users.findOne({_id: this.userId});
    var self = this;
    var handle = null;
    var jobIds = [];
    var Collection = JobExtra.getCollection();
    var _jobs = [];
    var collName = 'es_jobs';
    var query = {};
    if (!q || q.trim().length <= 0) q = undefined;

    if (user.isCompanyAdmin()) {
        if (type == 'online') {
            query = SuccessESQuery.onlineJob(user.companyId, q)
        } else if (type == 'expired') {
            query = SuccessESQuery.expiredJob(user.companyId, q)
        }
    } else {
        const selector = {
            $or: [
                {'recruiters.manager.userId': this.userId},
                {'recruiters.recruiter.userId': this.userId}
            ]
        };
        const jobAssignedIds = JobExtra.find(selector).map((doc) => doc.jobId);
        if (_.isEmpty(jobAssignedIds)) return this.ready();

        if (type == 'online') {
            query = SuccessESQuery.onlineJobForRecruiter(user.companyId, q, jobAssignedIds)
        } else if (type == 'expired') {
            query = SuccessESQuery.expiredJobForRecruiters(user.companyId, q, jobAssignedIds)
        }
    }

    const {err, hits} = ESSearch({
        index: 'vietnamworks',
        type: 'job',
        from: 0,
        size: limit + 1,
        body: query
    });

    if (!err) {
        var jobs = _.pluck(hits.hits, '_source');
        jobIds = _.pluck(jobs, 'jobId');

        _.each(jobs, (j) => {
            var job = new ESJob(j);
            var extra = Collection.findOne({jobId: job.jobId});
            if (!extra) {
                extra = new JobExtra();
                extra.jobId = job.jobId;
                extra.companyId = job.companyId;
                extra.stage.applied = job.numOfApplications;
                extra.save();
            }

            if (!_.isEqual(extra.jobTitle, job.jobTitle)) {
                extra.set('jobTitle', job.jobTitle);
            }

            const companyName = job.companyName.trim() || job.companyDesc.trim();
            if (!_.isEqual(extra.companyName, companyName)) {
                extra.set('companyName', companyName);
            }

            extra.save();

            job.extra = extra;
            job.cities = _.filter(citiesCache, function(r) {
                return  j.cityList.indexOf(r.vnwId) >= 0;
            });

            job.type = type;
            _jobs.push(job);
            this.added(collName, job.jobId, job);

        });

        if(!_.isEmpty(jobIds)) {
            // observe change from extra info
            var extraInfo = Collection.find({jobId: {$in: jobIds}});
            handle = extraInfo.observe({
                changed(newDoc, oldDoc) {
                    var job = _.findWhere(_jobs, {jobId: newDoc.jobId});
                    if (job) {
                        job.extra = newDoc;
                        self.changed(collName, job.jobId, job);
                    }
                }
            });
        }
    }

    self.ready();
    self.onStop(function () {
        handle && handle.stop();
    });
};

pubs.JobExtra = function (jobId) {
    check(jobId, Number);
    if (!this.userId) return null;
    return JobExtra.getCollection().find({jobId: jobId}, {limit: 1});
};


_.each(pubs, (func, name) => {
    Meteor.publish(name, func);
});

