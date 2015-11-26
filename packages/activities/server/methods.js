/**
 * Created by HungNguyen on 8/21/15.
 */

var logActivities = (typeString, ref, content, createBy)=> {
    if (!ref.userId) return false;

    var activity = new Activities();

    var typeCode = Core.getConfig(MODULE_NAME, typeString);

    activity.set('type', typeCode);

    ref && activity.set('ref', ref);

    content && activity.set('content', content);

    activity.set('createBy', createBy || ref.userId);

    Meteor.defer(()=> {
        activity.save();
    });

};

var methods = {
    // ref: {appId, candidateId, jobId}, content: { appliedDate}
    newApplication: function (ref, content) {
        let typeString = 'APPLICATION_CREATE'
            , createBy = 'vnw';

        logActivities(typeString, ref, content, createBy);
    },

    //ref : {arrayAppId, jobId}
    deleteApplication: function (ref) {
        let typeString = 'APPLICATION_DELETE'
            , createBy = 'vnw';

        logActivities(typeString, ref, null, createBy);

    },
    // ref : {jobId, userId}, content: { numOfApplication, isByUser}
    syncedJobDone: function (ref, content) {
        let typeString = 'JOB_SYNC_DONE'
            , createBy = content['isByUser'] ? null : 'vnw';

        logActivities(typeString, ref, content, createBy);
    },

    // ref : {jobId, userId} , content :{ isByUser}
    syncedJobFailed: function (ref, content) {
        let typeString = 'JOB_SYNC_FAILED'
            , createBy = content['isByUser'] ? null : 'vnw';

        logActivities(typeString, ref, content, createBy);
    },

    // ref : {appId, candidateId, userId} , content : { message }
    addComment: (ref, content) => {
        let typeString = 'RECRUITER_CREATE_COMMENT'
            , createBy = null;

        var application = Application.findOne({appId: ref.appId});
        if (!application) return false;

        logActivities(typeString, ref, content, createBy);
    },

    //arrayAppId, emailBody, userId
    sendMessage: function (arrayAppId, emailBody, userId) {
        let typeString = 'RECRUITER_CREATE_EMAIL'
            , createBy = null
            , ref = null
            , content = null;

        arrayAppId.forEach(function (appId) {
            var application = Application.findOne({appId: appId});
            if (!application) return false;

            ref = {
                appId: appId,
                userId: userId
            };

            content = {
                emailBody: emailBody
            };

            logActivities(typeString, ref, content, createBy);
        });

    },

    // arrayAppId, userId
    disqualified: (arrayEffect, userId) => {
        let typeString = 'RECRUITER_DISQUALIFIED'
            , createBy = null
            , ref = null
            , content = null;

        arrayEffect.forEach(function (appId) {

            var application = Application.findOne({appId: appId});
            if (!application) return false;

            application.disqualified = true;
            application.save();

            ref = {
                candidateId: application.candidateId,
                appId: application.appId,
                userId: userId
            };

            logActivities(typeString, ref, content, createBy);
        });

    },

    // arrayAppId, userId
    reverseDisqualified: (arrayEffect, userId) => {
        let typeString = 'RECRUITER_REVERSE_QUALIFIED'
            , createBy = null
            , ref = null
            , content = null;


        arrayEffect.forEach(function (appId) {

            var application = Application.findOne({appId: appId});
            if (!application) return false;

            application.disqualified = false;
            application.save();

            ref = {
                candidateId: application.candidateId,
                appId: application.appId,
                userId: userId
            };

            logActivities(typeString, ref, content, createBy);
        });

    },

    //ref : {appId, userId} , conent  : { from , to }
    changeStage: (ref, content)=> {
        let typeString = 'APPLICATION_STAGE_UPDATE'
            , createBy = null;

        logActivities(typeString, ref, content, createBy);
    },
    // ref : {appId, candidateId, arrayRecruiter} , content :{ datetime, emailBody}
    scheduleInterview: (ref, content)=> {
        let typeString = 'RECRUITER_SCHEDULE'
            , createBy = null;

        logActivities(typeString, ref, content, createBy);
    },
    // ???
    scoreCandidate: (ref, content) => {
        let typeString = 'RECRUITER_SCORE_CANDIDATE'
            , createBy = null;

        logActivities(typeString, ref, content, createBy);
    }

};

var _methods = {};
_.each(methods, function (func, key) {
    _methods[MODULE_NAME + '.' + key] = func;
});

Meteor.methods(_methods);