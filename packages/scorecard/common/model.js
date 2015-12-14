/**
 * JobCriteriaSetTemplate
 */

var mongoCollection = new Mongo.Collection(MODULE_NAME);

var model = Astro.Class({
    name: MODULE_NAME,
    collection: mongoCollection,
    fields: {
        ref: {
            companyId: 'number',
            jobId: 'number',
            appId: 'number',
            candidateId: 'number',
            recruiterId: 'string'
        },
        overall: 'number',
        notes: {
            keyTakeAways: 'string',
            fitCompanyCulture: 'string'
        },
        score_criteria: {
            type: 'array',
            default: ()=> {}
        },
        createdAt: {
            type: 'date',
            default: ()=> {
                return new Date()
            }
        },
        updatedAt: {
            type: 'date',
            default: ()=> {
                return new Date()
            }
        }
    }, // schema
    methods: {} // prototype
});


ScoreCard = model;
Collection = model.getCollection();