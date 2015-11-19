/**
 * Created by HungNguyen on 8/21/15.
 */

var moduleName = 'application';
var mongoCollection = new Mongo.Collection(moduleName);

var model = Astro.Class({
    name: moduleName,
    collection: mongoCollection,
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
            type: 'number',
            optional: true
        },
        companyId: {
            type: 'number'
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
            type: 'array',
            default: ()=> []
        },
        coverLetter: {
            type: 'string',
            optional: true
        },
        firstname: {
            type: 'string',
            optional: true
        },
        genderId: {
            type: 'number',
            optional: true
        },
        lastname: {
            type: 'string',
            optional: true
        },
        fullname: {
            type: 'string',
            optional: true
        },
        dob: {
            type: 'date',
            optional: true
        },
        isDeleted: {
            type: 'boolean',
            optional: false
        },
        countryId: {
            type: 'number',
            optional: true
        },
        cityName: {
            type: 'string',
            default: ''
        },
        emails: {
            type: 'array'
        },
        appliedDate: {
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


Application = model;
Collection = model.getCollection();


if (Meteor.isServer) {
    Collection.before.insert((userId, doc)=> {
        doc.fullname = [doc.firstname, doc.lastname].join(' ').trim();
    })
}
