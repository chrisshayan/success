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

    } // schema

});


Activities = model;
Collection = model.getCollection();


if (Meteor.isServer) {
    Collection.before.insert((userId, doc)=> {
        doc.fullname = [doc.firstname, doc.lastname].join(' ').trim();
    })
}


Activities = model;