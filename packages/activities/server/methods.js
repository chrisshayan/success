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
    //jobId, numOfApplications, isByUser
    syncedJobDone: ({...params}) => {
        let typeString = 'JOB_SYNC_DONE'
            , message = 'Job synced done'
            , createBy = params['isByUser'] ? Meteor.userId() : 'vnw';

        logActivities(typeString, params, message, createBy);
    },
    //jobId, numOfApplications, isByUser
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

        logActivities(typeString, params, message, createBy);
    },

    //arrayAppId, emailBody
    sendMessage: function (arrayAppId, emailBody) {
        let typeString = 'RECRUITER_CREATE_EMAIL'
            , message = params['emailBody']
            , createBy = Meteor.userId()
            , params = null;
        arrayAppId.forEach(function (appId) {
            params = {
                appId: appId,
                emailBody: emailBody
            };

            logActivities(typeString, params, message, createBy);
        });

    },

    // candidateId,value
    toggleQualified: (arrayCandidateId, value) => {
        let typeString = 'RECRUITER_TOGGLE_QUALIFIED'
            , message = params['value'] ? 'qualified' : 'disqualified'
            , createBy = Meteor.userId()
            , params = null;
        arrayCandidateId.forEach(function (candidateId) {
            params = {
                candidateId: candidateId,
                value: value
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
            , message = 'Change stage'
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