/**
 * Created by HungNguyen on 8/21/15.
 */

var moduleName = 'Application';
var collection = new Mongo.Collection(moduleName);

var model = Astro.Class({
    name: moduleName,
    collection: Collection,
    fields: {
        appId: {
            type: 'number',
            optional: true
        },
        type: {
            type: 'number',
            default: () => 0
        },
        jobId: {
            type: 'number',
            optional: true
        },
        candidateId: {
            type: 'string',
            optional: true
        },
        companyId: {
            type: 'number'
        },
        resumeId: {
            type: 'number',
            optional: true
        },
        stage: {
            type: 'number',
            default: ()=> 1
        }, // 0 : source, 1: applied, Default. 2: test assign, 3: Interview, 4: Offer letter, 5: Rejected
        matchingScore: {
            type: 'number',
            decimal: true,
            default: ()=> 0
        },
        disqualified: {
            type: 'boolean',
            default: ()=> false
        },
        candidateInfo: {
            type: 'object',
            optional: true
        },
        coverLetter: {
            type: 'string',
            optional: true
        },
        isDeleted: {
            type: 'number'
        },
        createdAt: {
            type: 'date',
            default: ()=> new Date()
        },
        updatedAt: {
            type: 'date',
            optional: true
        }

    }, // schema
    methods: {
        candidate: function () {

        },
        isExist: (condition) => {
            var query = condition || {entryID: this.entryId};
            return !!Collection.findOne(query);
        },
        matchingScoreLabel: ()=> {
            var matchingScore = this.matchingScore || 0;
            if (matchingScore >= 90)
                return " label-success ";
            else if (matchingScore >= 70)
                return " label-primary ";
            else if (matchingScore >= 50)
                return " label-warning ";
            else if (matchingScore > 0)
                return " label-default ";
            else
                return " hidden ";
        },
        isSentDirectly: ()=> {
            return this.source.type === 2;
        }
    } // prototype
});

Candidate = model;
Collection = model.getCollection();
