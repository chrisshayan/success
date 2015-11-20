/**
 * Created by HungNguyen on 8/21/15.
 */

var mongoCollection = new Mongo.Collection(MODULE_NAME);


var model = Astro.Class({
    name: MODULE_NAME,
    collection: mongoCollection,
    fields: {
        type: {
            type: 'number'
        },
        createBy: {
            type: 'string',
            default: 'vnw'
        },
        content: {
            type: 'object',
            default: ()=> {
            }
        },
        displayMessage: {
            type: 'string',
            optional: true,
            default: ''
        },
        createdAt: {
            type: 'date',
            default: ()=> new Date()
        }

    }, // schema
    methods: {
        newApplication: function (appId, candidateId, jobId, appliedDate) {
            if (!Meteor.userId()) return false;

            var activity = new model();
            var typeCode = Core.getConfig(MODULE_NAME, 'APPLICATION_CREATE');

            activity.set('type', typeCode);
            activity.set('displayMessage', 'Apply application');
            var content = {
                appId: appId,
                candidateId: candidateId,
                jobId: jobId,
                appliedDate: appliedDate
            };
            activity.set('content', content);


            activity.save();

        },
        deleteApplication: function (appId, jobId) {
            if (!Meteor.userId()) return false;

            var activity = new model();
            var typeCode = Core.getConfig(MODULE_NAME, 'APPLICATION_DELETE');

            activity.set('type', typeCode);


            activity.set('content', {
                appId: appId,
                jobId: jobId
            });

            activity.set('createBy', Meteor.userId());
            activity.set('displayMessage', 'Delete application ');
            var content = {
                appId: appId,
                candidateId: candidateId,
                jobId: jobId,
                appliedDate: appliedDate
            };
            activity.set('content', content);


            activity.save();

        },
        syncedJobDone: function (jobId, numOfApplications, isByUser) {
            if (!Meteor.userId()) return false;

            var activity = new model();
            var typeCode = Core.getConfig(MODULE_NAME, 'JOB_SYNC_DONE');

            activity.set('type', typeCode);

            activity.set('content', {
                jobId: jobId,
                numberOfApplications: numOfApplications
            });

            activity.set('createBy', isByUser ? Meteor.userId() : 'vnw');
            activity.set('displayMessage', 'Job synced done');

            activity.save();


        },
        syncedJobFailed: function (jobId, numOfApplications, isByUser) {
            if (!Meteor.userId()) return false;

            var activity = new model();
            var typeCode = Core.getConfig(MODULE_NAME, 'JOB_SYNC_FAILED');

            activity.set('type', typeCode);

            activity.set('content', {
                jobId: jobId,
                numberOfApplications: numOfApplications
            });

            activity.set('createBy', isByUser ? Meteor.userId() : 'vnw');
            activity.set('displayMessage', 'Job synced failed');

            activity.save();

        },
        addComment: function (appId, candidateId, message) {
            if (!Meteor.userId()) return false;

            var activity = new model();
            var typeCode = Core.getConfig(MODULE_NAME, 'COMMENT_CREATE');

            activity.set('type', typeCode);

            activity.set('content', {
                appId: appId,
                candidateId: candidateId,
                commentMessage: message
            });

            activity.set('createBy', Meteor.userId());
            activity.set('displayMessage', message);

            activity.save();

        },
        sendEmail: function (appId, candidateId, emailBody) {
            if (!Meteor.userId()) return false;
            var activity = new model();
            var typeCode = Core.getConfig(MODULE_NAME, 'EMAIL_CREATE');

            activity.set('type', typeCode);

            activity.set('content', {
                appId: appId,
                candidateId: candidateId,
                emailMessage: emailBody
            });
    
            activity.set('createBy', Meteor.userId());
            activity.set('displayMessage', emailBody);

            activity.save();

        }
    } // prototype
});


Activities = model;
Collection = model.getCollection();


if (Meteor.isServer) {
    Collection.before.insert((userId, doc)=> {
        doc.fullname = [doc.firstname, doc.lastname].join(' ').trim();
    })
}


Activities = model;