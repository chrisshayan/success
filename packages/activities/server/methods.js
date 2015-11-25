/**
 * Created by HungNguyen on 8/21/15.
 */

var logActivities = (typeString, ref, content, createBy)=> {
    if (!this.userId()) return false;

    var activity = new Activities();
    var typeCode = Core.getConfig(MODULE_NAME, typeString);

    activity.set('type', typeCode);

    ref && activity.set('ref', ref);

    content && activity.set('content', content);

    activity.set('createBy', createBy);

    Meteor.defer(()=> {
        activity.save();
    });

};

var methods = {
    // ref: {appId, candidateId, jobId}, content: { appliedDate}
    newApplication: (ref, content) => {
        let typeString = 'APPLICATION_CREATE'
            , createBy = 'vnw';

        logActivities(typeString, ref, content, createBy);
    },

    //ref : {arrayAppId, jobId}
    deleteApplication: (ref) => {
        let typeString = 'APPLICATION_DELETE'
            , createBy = 'vnw';

        logActivities(typeString, ref, null, createBy);

    },
    // ref : {jobId}, content: { numOfApplication, isByUser}
    syncedJobDone: (ref, content) => {
        let typeString = 'JOB_SYNC_DONE'
            , createBy = content['isByUser'] ? this.userId() : 'vnw';

        logActivities(typeString, ref, content, createBy);
    },

    // ref : {jobId} , content :{ isByUser}
    syncedJobFailed: (ref, content) => {
        let typeString = 'JOB_SYNC_FAILED'
            , createBy = content['isByUser'] ? this.userId() : 'vnw';

        logActivities(typeString, ref, content, createBy);
    },

    // ref : {appId, candidateId} , content : { message }
    addComment: (ref, content) => {
        let typeString = 'RECRUITER_CREATE_COMMENT'
            , createBy = this.userId();

        var application = Application.findOne({appId: ref.appId});
        if (!application) return false;

        logActivities(typeString, ref, content, createBy);
    },

    //arrayAppId, emailBody
    sendMessage: function (arrayAppId, emailBody) {
        let typeString = 'RECRUITER_CREATE_EMAIL'
            , createBy = this.userId()
            , ref = null
            , content = null;

        arrayAppId.forEach(function (appId) {
            var application = Application.findOne({appId: appId});
            if (!application) return false;

            ref = {
                appId: appId
            };

            content = {
                emailBody: emailBody
            };

            logActivities(typeString, ref, content, createBy);
        });

    },

    // arrayAppId
    disqualified: (arrayEffect) => {
        let typeString = 'RECRUITER_DISQUALIFIED'
            , createBy = this.userId()
            , ref = null
            , content = null;

        arrayEffect.forEach(function (appId) {

            var application = Application.findOne({appId: appId});
            if (!application) return false;

            application.disqualified = true;
            application.save();

            ref = {
                candidateId: application.candidateId,
                appId: application.appId
            };

            logActivities(typeString, ref, content, createBy);
        });

    },

    // arrayAppId
    reverseDisqualified: (arrayEffect) => {
        let typeString = 'RECRUITER_REVERSE_QUALIFIED'
            , createBy = this.userId()
            , ref = null
            , content = null;


        arrayEffect.forEach(function (appId) {

            var application = Application.findOne({appId: appId});
            if (!application) return false;

            application.disqualified = false;
            application.save();

            ref = {
                candidateId: application.candidateId,
                appId: application.appId
            };

            logActivities(typeString, ref, content, createBy);
        });

    },

    //ref : {appId} , conent  : { from , to }
    changeStage: (ref, content)=> {
        let typeString = 'APPLICATION_STAGE_UPDATE'
            , createBy = this.userId();

        logActivities(typeString, ref, content, createBy);
    },
    // ref : {appId, candidateId, arrayRecruiter} , content :{ datetime, emailBody}
    scheduleInterview: (ref, content)=> {
        let typeString = 'RECRUITER_SCHEDULE'
            , createBy = this.userId();

        logActivities(typeString, ref, content, createBy);
    },
    // ???
    scoreCandidate: (ref, content) => {
        let typeString = 'RECRUITER_SCORE_CANDIDATE'
            , createBy = this.userId();

        logActivities(typeString, ref, content, createBy);
    }

};

var _methods = {};
_.each(methods, function (func, key) {
    _methods[MODULE_NAME + '.' + key] = func;
});

Meteor.methods(_methods);