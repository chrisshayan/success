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
            type: 'string'
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
            activity.set('createBy', Meteor.userId());
            activity.set('displayMessage', 'Applied application');
            var content = {
                appId: appId,
                candidateId: candidateId,
                jobId: jobId
            };
            activity.set('content', content);
            activity.set('createdAt', appliedDate);

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