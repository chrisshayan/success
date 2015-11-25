/**
 * Created by HungNguyen on 8/21/15.
 */

var logActivities = (typeString, content, createBy)=> {
    if (!this.userId()) return false;

    var activity = new Activities();
    var typeCode = Core.getConfig(MODULE_NAME, typeString);

    activity.set('type', typeCode);

    activity.set('content', content);

    createBy = createBy || this.userId();
    activity.set('createBy', createBy);

    Meteor.defer(()=> {
        activity.save();
    });

};

var methods = {
    //appId, candidateId, jobId, appliedDate
    newApplication: ({...params}) => {
        let typeString = 'APPLICATION_CREATE'
            , createBy = 'vnw';

        logActivities(typeString, params, createBy);
    },
    //arrayAppId, jobId
    deleteApplication: ({...params}) => {
        let typeString = 'APPLICATION_DELETE'
            , createBy = 'vnw';

        logActivities(typeString, params, createBy);

    },
    //jobId, numOfApplication, isByUser
    syncedJobDone: ({...params}) => {
        let typeString = 'JOB_SYNC_DONE'
            , createBy = params['isByUser'] ? this.userId() : 'vnw';

        logActivities(typeString, params, createBy);
    },
    //jobId, isByUser
    syncedJobFailed: ({...params}) => {
        let typeString = 'JOB_SYNC_FAILED'
            , createBy = params['isByUser'] ? this.userId() : 'vnw';

        logActivities(typeString, params, createBy);
    },
    //appId, candidateId, message
    addComment: ({...params})=> {
        let typeString = 'RECRUITER_CREATE_COMMENT'
            , createBy = this.userId();

        var application = Application.findOne({appId: params.appId});
        if (!application) return false;

        logActivities(typeString, params, createBy);
    },

    //arrayAppId, emailBody
    sendMessage: function (arrayAppId, emailBody) {
        let typeString = 'RECRUITER_CREATE_EMAIL'
            , createBy = this.userId()
            , params = null;
        arrayAppId.forEach(function (appId) {
            var application = Application.findOne({appId: appId});
            if (!application) return false;

            params = {
                appId: appId,
                emailBody: emailBody
            };

            logActivities(typeString, params, createBy);
        });

    },

    // candidateId,isQualify
    toggleQualified: (arrayEffect, isQualify) => {
        let typeString = 'RECRUITER_TOGGLE_QUALIFIED'
            , createBy = this.userId()
            , params = null;
        arrayEffect.forEach(function (item) {

            var application = Application.findOne({appId: item.appId});
            if (!application) return false;

            application.disqualified = isQualify;
            application.save();

            params = {
                candidateId: item.candidateId,
                appId: item.appId,
                isQualify: isQualify
            };

            logActivities(typeString, params, createBy);
        });

    },
    //appId, from , to
    changeStage: ({...params})=> {
        let typeString = 'APPLICATION_STAGE_UPDATE'
            , createBy = this.userId();

        logActivities(typeString, params, createBy);
    },
    // appId, candidateId, arrayRecruiter, datetime, emailBody
    scheduleInterview: ({...params})=> {
        let typeString = 'RECRUITER_SCHEDULE'
            , createBy = this.userId();

        logActivities(typeString, params, createBy);
    },
    // ???
    scoreCandidate: ({...params}) => {
        let typeString = 'RECRUITER_SCORE_CANDIDATE'
            , createBy = this.userId();

        logActivities(typeString, params, createBy);
    }

};

var _methods = {};
_.each(methods, function (func, key) {
    _methods[MODULE_NAME + '.' + key] = func;
});

Meteor.methods(_methods);