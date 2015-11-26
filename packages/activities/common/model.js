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
            default: ()=> 'vnw'
        },
        ref: {
            type: 'object',
            default: ()=> {
            }
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

    } // schema

});


Activities = model;
Collection = model.getCollection();


if (Meteor.isServer) {
    var AppCollection = Application.getCollection();
    AppCollection.after.insert(function (userId, doc) {
        let ref = {appId: doc.appId, candidateId: doc.candidateId, jobId: doc.jobId}
            , content = {appliedDate: doc.appliedDate};

        Meteor.call('activities.newApplication', ref, content);
    })
}


Activities = model;