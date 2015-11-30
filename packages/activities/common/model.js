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
        createdBy: {
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
        createdAt: {
            type: 'date',
            default: ()=> new Date()
        }

    } // schema

});


Activities = model;
Collection = model.getCollection();
