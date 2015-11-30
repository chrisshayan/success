var addToJobCollection = function (type, data) {
    Job(Collections.SyncQueue, type, data).save();
};


ESSearch = Meteor.wrapAsync(function (query, cb) {
    ES.search(query).then(function (body) {
        cb(null, body)
    }, function (error) {
        cb(error, {});
    });
});

var pubs = {};


pubs.ESJobs = function (type, limit, q) {
    var self = this;
    var handle = null;
    var jobIds = [];
    var Collection = JobExtra.getCollection();
    var _jobs = [];
    var collName = 'es_jobs';
    var query = {};
    if (!q || q.trim().length <= 0) q = undefined;

    if (type == 'online') {
        query = SuccessESQuery.onlineJob(751, q)
    } else if (type == 'expired') {
        query = SuccessESQuery.expiredJob(751, q)
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
                extra.save();

                var data = {
                    jobId: extra.jobId,
                    companyId: extra.companyId
                };

                addToJobCollection('getApplications', data);
            }
            job.extra = extra;
            job.cities = Meteor.cities.find({languageId: 2, vnwId: {$in: j.cityList}}, {fields: {name: 1}}).fetch();
            job.type = type;
            _jobs.push(job);
            this.added(collName, job.jobId, job);

        });

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

