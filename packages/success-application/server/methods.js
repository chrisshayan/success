/**
 * Created by HungNguyen on 8/21/15.
 */

var methods = {};

methods.applicationStageCount = function (jobId, stageId) {
    var result = {
        qualify: 0,
        disqualified: 0
    };
    if (this.userId && jobId && stageId !== null) {
        const stage = Success.APPLICATION_STAGES[stageId],
            AppCollection = Application.getCollection(),
            cond = {jobId: jobId, stage: stageId},
            cond1 = {disqualified: {$nin: [stage.alias]}},
            cond2 = {disqualified: stage.alias};

        result['qualify'] = AppCollection.find({...cond, ...cond1}).count();
        result['disqualified'] = AppCollection.find({...cond, ...cond2}).count();
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
    var jobCollection = JobExtra.getCollection();
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


methods['applications.toggleQualify'] = function (appIds = [], stage = null, status = null) {
    if (!this.userId || _.isEmpty(appIds) || stage === null || status === null) return false;
    const selector = {
        appId: {
            $in: appIds
        }
    };
    const modifier = {};

    if (status === true) {
        modifier['$pull'] = {
            disqualified: stage
        };
    } else {
        modifier['$push'] = {
            disqualified: stage
        };
    }
    if (!_.isEmpty(modifier)) {
        return Collection.update(selector, modifier, {multi: true});
    }
    return false;
};


methods['applications.moveStage'] = function (appId, stage = null) {
    if (!this.userId || !_.isNumber(appId) || stage === null) return false;

    const app = Collection.findOne({appId: appId});

    if (app) {
        const jobExtra = JobExtra.findOne({jobId: app.jobId});
        if (jobExtra) {
            const fromStage = Success.APPLICATION_STAGES[app.stage];
            const toStage = Success.APPLICATION_STAGES[stage];
            if (fromStage && toStage && fromStage.id != toStage.id) {
                app.set('stage', toStage.id);

                Meteor.defer(function () {
                    // update stage counter

                    jobExtra.inc({
                        [`stage.${fromStage.alias}`]: -1,
                        [`stage.${toStage.alias}`]: 1,
                    });
                    jobExtra.save();
                });

                return app.save();
            }
        }
    }
    return false;
};


Meteor.methods(methods);
