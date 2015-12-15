/**
 * JobCriteriaSetTemplate
 */

var scoreCardCollection = new Mongo.Collection(SCORECARD_MODULE_NAME);

var scoreCardModel = Astro.Class({
    name: SCORECARD_MODULE_NAME,
    collection: scoreCardCollection,
    fields: {
        ref: {
            type: 'object',
            default: ()=> {
                return {
                    companyId: null,
                    jobId: null,
                    appId: null,
                    type: null,
                    candidateId: null,
                    recruiterId: null
                }
            }
        }
    },
    overall: 'number',
    notes: {
        type: 'object',
        default: ()=> {
            return {
                keyTakeAways: '',
                fitCompanyCulture: ''
            }
        },
        score_criteria: {
            type: 'array',
            default: ()=> {
            }
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

scoreCardModel.prototype.isExist = function (condition) {
    //noinspection JSUnresolvedVariable
    condition = condition || {
            'ref.recruiterId': this.ref.recruiterId,
            'ref.appId': this.ref.appId
        };

    return ScoreCardCollection.findOne(condition);
};

ScoreCard = scoreCardModel;
ScoreCardCollection = scoreCardModel.getCollection();


// Scorecard summary

var summaryCollection = new Mongo.Collection(SUMMARY_MODULE_NAME);

var summaryModel = Astro.Class({
    name: SUMMARY_MODULE_NAME,
    collection: summaryCollection,
    fields: {}, // schema
    methods: {} // prototype
});

summaryModel.prototype.isExist = function (condition) {
    //noinspection JSUnresolvedVariable
    condition = condition || {
            'ref.recruiterId': this.ref.recruiterId,
            'ref.appId': this.ref.appId,
            'ref.type': this.ref.type
        };

    return Collection.findOne(condition);
};

ScoreCardSummary = summaryModel;
SummaryCollection = summaryModel.getCollection();







