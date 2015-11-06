/**
 * Created by HungNguyen on 8/21/15.
 */

var candidateCollection = Candidate.collection;
var jobCollection = vnwJob.collection;

var methods = {
    /*updateApplications: function (query, options) {
     return Collection.update(query, options || {});
     },
     getApplication: function (query, options) {
     return Collection.find(query, options);
     }*/
};

/**
 * Update application state
 * @param entryId {Number}
 * @param toStage {Number} in range 1,2,3,4,5
 * @returns {Boolean} the update result
 */
methods.updateApplicationStage = function (option) {
    try {
        if (!this.userId) return false;

        check(option, {
            application: String,
            stage: Number
        });
        check(option.stage, Match.OneOf(0, 1, 2, 3, 4, 5));

        var cond = {
            _id: option.application
        };

        //var application = Meteor.applications.findOne(cond);
        var application = Collection.findOne(cond);
        if (!application) return false;
        if ((application.stage == 0 && option.stage == 1) || (application.stage == 1 && option.stage == 0)) return false;

        var data = {
            $set: {
                stage: option.stage
            }
        };

        var result = Collection.update({_id: application._id}, data);
        if (result) {
            // log to activities
            var activity = new Activity();
            activity.data = {
                jobId: application.jobId,
                applicationId: application._id,
                candidateId: application.candidateId,
                fromStage: application.stage,
                toStage: option.stage
            };
            activity.companyId = application.companyId;
            activity.createdBy = this.userId;
            activity.updateApplicationStage();
        }
    } catch (e) {
        debuger(e);
    }
    return result;
};


/**
 * Get first application of job stage
 * @param opt {Object}
 * opt.jobId {Number}
 * opt.stage {Number}
 * @returns { Number|null}
 */
methods.getFirstJobApplication = function (opt) {
    try {
        if (!this.userId) return false;

        check(opt, {
            jobId: String,
            stage: Number
        });
        //var job = Collections.Jobs.findOne({_id: opt.jobId});
        var job = jobCollection.findOne({_id: opt.jobId});
        if (!job) return false;

        var application = Collection.findOne({
            jobId: job.jobId,
            stage: opt.stage
        }, {sort: {createdAt: -1}});

        return application ? application._id : false;
    } catch (e) {
        debuger(e);
    }
    return null;
};

/**
 * check application exists in job stage
 * @param opt {Object}
 * @param opt.jobId {String}
 * @param opt.stage {Number}
 * @param opt.application {String}
 * @returns {boolean}
 */
methods.checkApplicationInStag = function (opt) {
    if (!this.userId) return false;
    check(opt, {
        jobId: String,
        stage: Number,
        application: String
    });
    //var job = Collections.Jobs.findOne({_id: opt.jobId});
    var job = jobCollection.findOne({_id: opt.jobId});
    if (!job) return false;
    var criteria = {
        _id: opt.application,
        jobId: job.jobId,
        stage: opt.stage
    };
    //return !!Meteor.applications.find(criteria).count();
    return !!Collection.find(criteria).count();
};


/**
 * Update application qualify
 * @param applicationId {Number}
 */
methods.disqualifyApplication = function (applicationId) {
    try {
        if (!this.userId) return false;
        this.unblock();

        check(applicationId, String);
        var conditions = {
            _id: applicationId
        };
        var application = Collection.findOne(conditions);

        if (!application || application.disqualified == true) return;

        var modifier = {
            $set: {
                disqualified: true
            }
        }
        var result = Collection.update(conditions, modifier);
        if (result) {
            // Log activity
            var activity = new Activity();
            activity.companyId = application.companyId;
            activity.createdBy = this.userId;
            activity.data = {
                applicationId: applicationId
            };
            activity.disqualifiedApplication();
        }
    } catch (e) {
        debuger(e);
    }
};


methods.disqualifyApplications = function (ids) {
    try {
        if (!this.userId) return false;
        var self = this;
        this.unblock();

        check(ids, [String]);

        _.each(ids, function (_id) {
            Meteor.defer(function () {
                var application = Collection.findOne({_id: _id});
                if (!application || application.disqualified == true) return;

                var modifier = {
                    $set: {
                        disqualified: true
                    }
                };
                var result = Collection.update({_id: application._id}, modifier);
                if (result) {
                    // Log activity
                    var activity = new Activity();
                    activity.companyId = application.companyId;
                    activity.createdBy = self.userId;
                    activity.data = {
                        applicationId: application._id
                    };
                    activity.disqualifiedApplication();
                }
            });
        });

    } catch (e) {
        debuger(e);
    }
};
/**
 * Update application qualify
 * @param applicationId {Number}
 */
methods.revertApplication = function (applicationId) {
    try {
        if (!this.userId) return false;
        check(applicationId, String);
        var application = Collection.findOne({_id: applicationId});
        if (!application) return;
        var conditions = {
            _id: applicationId
        };
        var modifier = {
            $set: {
                disqualified: false
            }
        };
        var result = Collection.update(conditions, modifier);
        if (result) {
            // Log activity
            var activity = new Activity();
            activity.companyId = application.companyId;
            activity.createdBy = this.userId;
            activity.data = {
                applicationId: applicationId
            };
            activity.revertApplication();
        }
    } catch (e) {
        debuger(e);
    }
    return result;
};


/**
 * Add comment to application
 * @param data {Object}
 * @param data.application {Number}
 * @param data.content {String}
 */
methods.addCommentApplication = function (data) {
    try {
        check(data, {
            application: String,
            content: String
        });

        this.unblock();
        var application = Collection.findOne({_id: data.application});
        if (!application) return false;
        var activity = new Activity();
        activity.companyId = application.companyId;
        activity.createdBy = this.userId;
        activity.data = {
            applicationId: data.application,
            content: data.content
        };
        activity.addCommentApplication();
    } catch (e) {
        debuger(e);
        return false;
    }
    return true;
};

/**
 * check application exists in job stage
 * @param opt {Object}
 * @param opt.jobId {String}
 * @param opt.stage {Number}
 * @param opt.application {String}
 * @returns {boolean}
 */

methods.checkApplicationInStage = function (opt) {
    if (!this.userId) return false;
    check(opt, {
        jobId: String,
        stage: Number,
        application: String
    });
    //var job = Collections.Jobs.findOne({_id: opt.jobId});
    var job = Meteor['jobs'].findOne({_id: opt.jobId});
    if (!job) return false;
    var criteria = {
        _id: opt.application,
        jobId: job.jobId,
        stage: opt.stage
    };
    return !!Collection.find(criteria).count();
};

methods.applicationStageCount = function (jobId, stage) {
    var result = {
        qualify: 0,
        disqualified: 0
    };
    if (this.userId && jobId && stage !== null) {
        var job = jobCollection.findOne({_id: jobId});
        if (job) {
            result['qualify'] = Collection.find({
                'source.jobId': job.source.jobId,
                stage: stage,
                disqualified: false
            }).count();
            result['disqualified'] = Collection.find({
                'source.jobId': job.source.jobId,
                stage: stage,
                disqualified: true
            }).count();
        }
    }
    return result;
};


/**
 * check job has application with specific stage
 * @param jobId
 * @param stage
 * @returns {boolean}
 */
methods.hasApplication = function (jobId, stage) {
    check(jobId, String);
    check(stage, Number);
    var job = jobCollection.findOne({_id: jobId});
    if (job) {
        return Collection.findOne({'source.jobId': job.source.jobId, stage: stage}, {
            sort: {
                createdAt: -1
            }
        });
    }
    return false;
};


Meteor.methods(methods);