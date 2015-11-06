/**
 * Created by HungNguyen on 8/21/15.
 */

var methods = {
    updateApplications: function (query, options) {
        return Collection.update(query, options || {});
    },
    getApplication: function (query, options) {
        return Collection.find(query, options);
    }
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

        var application = Collections.Applications.findOne(cond);
        if (!application) return false;
        if ((application.stage == 0 && option.stage == 1) || (application.stage == 1 && option.stage == 0)) return false;

        var data = {
            $set: {
                stage: option.stage
            }
        }
        var result = Collections.Applications.update({_id: application._id}, data);
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


methods.applicationStageCount = function(jobId, stage) {
    var result = {
        qualify: 0,
        disqualified: 0
    };
    if(this.userId && jobId && stage !== null) {
        var job = Collections.Jobs.findOne({_id: jobId});
        if(job) {
            result['qualify'] = Collections.Applications.find({jobId: job.jobId, stage: stage, disqualified: false}).count();
            result['disqualified'] = Collections.Applications.find({jobId: job.jobId, stage: stage, disqualified: true}).count();
        }
    }
    return result;
};

Meteor.methods(methods);