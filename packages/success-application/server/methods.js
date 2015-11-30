/**
 * Created by HungNguyen on 8/21/15.
 */

var methods = {};
const {
    APPLICATION_CREATE,
    APPLICATION_STAGE_UPDATE,
    RECRUITER_CREATE_COMMENT,
    RECRUITER_CREATE_EMAIL,
    RECRUITER_DISQUALIFIED,
    RECRUITER_REVERSE_QUALIFIED,
    RECRUITER_SCHEDULE,
    RECRUITER_SCORE_CANDIDATE
    } = Activities.TYPE;

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


methods['applications.toggleQualify'] = function (jobId = 0, appIds = [], stage = null, isQualified = null) {
    if (!this.userId || _.isEmpty(appIds) || stage === null || isQualified === null) return false;
    this.unblock();
    const userId = this.userId;

    _.each(appIds, (appId) => {
        const app = Application.findOne({jobId: jobId, appId: appId});
        if (app) {
            const selector = { _id: app._id };
            const modifier = {};
            const activity = new Activities({
                ref: {
                    companyId: app.companyId,
                    jobId: app.jobId,
                    appId: app.appId,
                    candidateId: app.candidateId
                },
                content: {
                    stage: _.findWhere(Success.APPLICATION_STAGES, {alias: stage})
                },
                createdBy: userId
            });

            if (isQualified === true) {
                modifier['$pull'] = {
                    disqualified: stage
                };

                activity.type = RECRUITER_REVERSE_QUALIFIED;
            } else {
                modifier['$push'] = {
                    disqualified: stage
                };

                activity.type = RECRUITER_DISQUALIFIED;
            }

            if (!_.isEmpty(modifier)) {

                const result = Collection.update(selector, modifier);
                if(result) {
                    Meteor.defer(() => {
                        activity.save();
                    });
                }
            }
        }
    });
    return true;
};


methods['applications.moveStage'] = function (appId, stage = null) {
    if (!this.userId || !_.isNumber(appId) || stage === null) return false;
    const userId = this.userId;
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
                        [`stage.${toStage.alias}`]: 1
                    });
                    jobExtra.save();
                });
                const result = app.save();
                if (result) {
                    Meteor.defer(function () {
                        const ref = {
                            companyId: app.companyId,
                            jobId: app.jobId,
                            appId: app.appId,
                            candidateId: app.candidateId
                        };
                        const content = {
                            from: fromStage,
                            to: toStage
                        };
                        new Activities({
                            type: Activities.TYPE.APPLICATION_STAGE_UPDATE,
                            ref: ref,
                            content: content,
                            createdBy: userId
                        }).save();
                    });
                }
                return result;
            }
        }
    }
    return false;
};

methods['application.addComment'] = function (jobId = 0, appId = 0, text = '') {
    if (!this.userId) return false;
    check(jobId, Number);
    check(appId, Number);
    check(text, String);

    var app = Application.findOne({jobId: jobId, appId: appId});
    if (!app) return false;
    const ref = {
        companyId: app.companyId,
        jobId: jobId,
        candidateId: app.candidateId,
        appId: appId
    };
    const content = {
        text: text
    };
    return new Activities({
        type: Activities.TYPE.RECRUITER_CREATE_COMMENT,
        ref: ref,
        content: content,
        createdBy: this.userId
    }).save();
};

methods['application.sendMessage'] = function (jobId = [], appIds = [], data = {}) {
    if (!this.userId) return false;
    this.unblock();
    check(jobId, Number);
    check(appIds, [Number]);
    check(data, Object);

    _.each(appIds, (appId) => {
        var app = Application.findOne({jobId: jobId, appId: appId});
        if (!app) return false;

        const ref = {
            companyId: app.companyId,
            jobId: jobId,
            candidateId: app.candidateId,
            appId: appId
        };

        new Activities({
            type: Activities.TYPE.RECRUITER_CREATE_EMAIL,
            ref: ref,
            content: data,
            createdBy: this.userId
        }).save();
    });
    return true;
};


Meteor.methods(methods);
