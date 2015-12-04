var ESSearch = Meteor.wrapAsync(function (query, cb) {
    ES.search(query).then(function (body) {
        cb(null, body)
    }, function (error) {
        cb(error, {});
    });
});

var ESSuggest = Meteor.wrapAsync(function (query, cb) {
    ES.suggest(query).then(function (body) {
        cb(null, body)
    }, function (error) {
        cb(error, {});
    });
});

var methods = {};
methods.jobListCount = function () {
    const counter = {online: 0, expired: 0};
    if (this.userId) {
        try {
            const user = Meteor.users.findOne({_id: this.userId});
            let query = {};
            if (user.isCompanyAdmin()) {
                query = SuccessESQuery.jobListCounter(user.companyId);
            } else {
                const selector = {
                    $or: [
                        {'recruiters.manager.userId': this.userId},
                        {'recruiters.recruiter.userId': this.userId}
                    ]
                };
                const jobIds = JobExtra.find(selector).map((doc) => doc.jobId)
                if (_.isEmpty(jobIds)) return counter;
                query = SuccessESQuery.jobListCounterForRecruiter(user.companyId, jobIds);
            }

            const result = ESSearch({
                index: 'vietnamworks',
                type: 'job',
                from: 0,
                size: 0,
                body: query
            });

            if (result && result['aggregations']) {
                const aggs = result['aggregations'];
                if (aggs['online'] && aggs['online']['doc_count']) {
                    counter['online'] = aggs['online']['doc_count'];
                }

                if (aggs['expired'] && aggs['expired']['doc_count']) {
                    counter['expired'] = aggs['expired']['doc_count'];
                }
            }
        } catch (e) {
            console.trace(e);
        }
    }
    return counter;
};


methods.getCompany = function (companyId) {
    let companyInfo = new ESCompanyInfo();
    if (this.userId) {
        try {
            const user = Meteor.users.findOne({_id: this.userId});
            if (user && user.companyId) {
                const result = ESSearch({
                    index: 'employerInformation',
                    type: 'company',
                    from: 0,
                    size: 1,
                    body: SuccessESQuery.getCompanyInfo(user.companyId)
                });

                if (result && result['hits']) {
                    const hits = result['hits']['hits'];
                    if (hits.length > 0) {
                        const data = hits[0]['_source'];
                        companyInfo = new ESCompanyInfo(data);
                    }
                }
            }
        } catch (e) {
            console.trace(e);
        }
    }
    return companyInfo;
};

methods.getJobInfo = function (jobId) {
    let job = new ESJob();
    if (this.userId) {
        try {
            if (jobId) {
                const result = ESSearch({
                    index: 'vietnamworks',
                    type: 'job',
                    from: 0,
                    size: 1,
                    body: SuccessESQuery.getJobInfo(jobId)
                });

                if (result && result['hits']) {
                    const hits = result['hits']['hits'];
                    if (hits.length > 0) {
                        const data = hits[0]['_source'];
                        job = new ESJob(data);

                        const level = Meteor.job_levels.findOne({vnwId: data.jobLevelId});
                        job.jobLevel = level && level.name ? level.name : '';
                        job.cities = Meteor.cities.find({
                            languageId: 2,
                            vnwId: {$in: data.cityList}
                        }, {fields: {name: 1}}).fetch();
                        const industryIds = _.pluck(job.industries, 'industryId');
                        job.industries = Meteor.industries.find({
                            languageId: 2,
                            vnwId: {$in: industryIds}
                        }, {fields: {name: 1}}).fetch();

                        /***
                         * update jobTitle and companyName
                         * @type {*|{}|any}
                         */
                        var extra = JobExtra.findOne({jobId: job.jobId});
                        if (!extra) {
                            extra = new JobExtra();
                            extra.jobId = job.jobId;
                            extra.companyId = job.companyId;
                            extra.save();
                        }

                        if (!_.isEqual(extra.jobTitle, job.jobTitle)) {
                            extra.set('jobTitle', job.jobTitle);
                        }

                        if (!_.isEqual(extra.numOfApplications, job.numOfApplications)) {
                            extra.set('numOfApplications', job.numOfApplications);
                            extra.set('syncState', 'ready');
                        }

                        const companyName = job.companyName.trim() || job.companyDesc.trim();
                        if (!_.isEqual(extra.companyName, companyName)) {
                            extra.set('companyName', companyName);
                        }
                        extra.save();
                    }
                }
            }

            if (extra.syncState === 'ready' && extra.jobId && extra.companyId) {
                var data = {
                    jobId: extra.jobId,
                    companyId: extra.companyId
                };
                Job(Collections.SyncQueue, 'getApplications', data).save();
            }
        } catch (e) {
            console.trace(e);
        }
    }
    return job;
};

methods.suggestSkills = function () {
    return ESSuggest({
        index: 'suggester',
        body: {
            "skill": {
                "text": "php",
                "completion": {
                    "field": "skillNameSuggest"
                }
            }
        }
    });
};

methods['ES.lastOpenJobs'] = function () {
    if (!this.userId) return [];
    const jobs = [];
    const user = Meteor.users.findOne({_id: this.userId});
    let query = {};

    if (user.isCompanyAdmin()) {
        query = SuccessESQuery.onlineJob(user.companyId)
    } else {
        const selector = {
            $or: [
                {'recruiters.manager.userId': this.userId},
                {'recruiters.recruiter.userId': this.userId}
            ]
        };
        const jobIds = JobExtra.find(selector).map((doc) => doc.jobId);
        if (_.isEmpty(jobIds)) return [];
        query = SuccessESQuery.onlineJobForRecruiter(user.companyId, '', jobIds)
    }

    const {err, hits} = ESSearch({
        index: 'vietnamworks',
        type: 'job',
        from: 0,
        size: 10,
        body: query
    });

    if (!err) {
        const _jobs = _.pluck(hits.hits, '_source');
        _.each(_jobs, (j) => {
            var job = new ESJob(j);
            job.cities = Meteor.cities.find({languageId: 2, vnwId: {$in: j.cityList}}, {fields: {name: 1}}).fetch();
            jobs.push(job);
        });
    }

    return jobs;
};

Meteor.methods(methods);