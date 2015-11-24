/**
 * Created by HungNguyen on 8/21/15.
 */

var logActivities = (typeString, content, displayMessage, createBy)=> {
    if (!Meteor.userId()) return false;

    var activity = new Activities();
    var typeCode = Core.getConfig(MODULE_NAME, typeString);

    activity.set('type', typeCode);

    activity.set('content', content);

    createBy && activity.set('createBy', Meteor.userId());

    activity.set('displayMessage', displayMessage);

    Meteor.defer(()=> {
        activity.save();
    });

};

var methods = {
    //appId, candidateId, jobId, appliedDate
    newApplication: ({...params}) => {
        let typeString = 'APPLICATION_CREATE'
            , message = 'Apply application'
            , createBy = 'vnw';

        logActivities(typeString, params, message, createBy);
    },
    //arrayAppId, jobId
    deleteApplication: (arrayAppId, jobId) => {
        let typeString = 'APPLICATION_DELETE'
            , message = 'Delete application'
            , createBy = 'vnw';

        logActivities(typeString, params, message, createBy);

    },
    //jobId, numOfApplication, isByUser
    syncedJobDone: ({...params}) => {
        let typeString = 'JOB_SYNC_DONE'
            , message = 'Job synced done'
            , createBy = params['isByUser'] ? Meteor.userId() : 'vnw';

        logActivities(typeString, params, message, createBy);
    },
    //jobId, isByUser
    syncedJobFailed: ({...params}) => {
        let typeString = 'JOB_SYNC_FAILED'
            , message = 'Job synced failed'
            , createBy = params['isByUser'] ? Meteor.userId() : 'vnw';

        logActivities(typeString, params, message, createBy);
    },
    //appId, candidateId, message
    addComment: ({...params})=> {
        let typeString = 'RECRUITER_CREATE_COMMENT'
            , message = params['message']
            , createBy = Meteor.userId();

        var application = Application.findOne({_id: params.appId});
        if (!application) return false;

        logActivities(typeString, params, message, createBy);
    },

    //arrayAppId, emailBody
    sendMessage: function (arrayAppId, emailBody) {
        let typeString = 'RECRUITER_CREATE_EMAIL'
            , message = params['emailBody']
            , createBy = Meteor.userId()
            , params = null;
        arrayAppId.forEach(function (appId) {
            var application = Application.findOne({_id: params.appId});
            if (!application) return false;

            params = {
                appId: appId,
                emailBody: emailBody
            };

            logActivities(typeString, params, message, createBy);
        });

    },

    // candidateId,isQualify
    toggleQualified: (arrayEffect, isQualify) => {
        let typeString = 'RECRUITER_TOGGLE_QUALIFIED'
            , message = params['value'] ? 'qualified' : 'disqualified'
            , createBy = Meteor.userId()
            , params = null;
        arrayEffect.forEach(function (item) {

            var application = Application.findOne({_id: params.appId});
            if (!application) return false;

            application.disqualified = isQualify;
            application.save();

            params = {
                candidateId: item.candidateId,
                appId: item.appId,
                isQualify: isQualify
            };

            logActivities(typeString, params, message, createBy);
        });

    },
    //appId, from , to
    changeStage: ({...params})=> {
        let typeString = 'APPLICATION_STAGE_UPDATE'
            , message = 'Change stage'
            , createBy = Meteor.userId();

        logActivities(typeString, params, message, createBy);
    },
    // appId, candidateId, arrayRecruiter, datetime, emailBody
    scheduleInterview: ({...params})=> {
        let typeString = 'RECRUITER_SCHEDULE'
            , message = 'Schedule an interview'
            , createBy = Meteor.userId();

        logActivities(typeString, params, message, createBy);
    },
    // ???
    scoreCandidate: ({...params}) => {
        let typeString = 'RECRUITER_SCORE_CANDIDATE'
            , message = 'Scoring candidate'
            , createBy = Meteor.userId();

        logActivities(typeString, params, message, createBy);
    }

};

var _methods = {};
_.each(methods, function (func, key) {
    _methods[MODULE_NAME + '.' + key] = func;
});

Meteor.methods(_methods);