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
        },
        overall: 'number',
        notes: {
            type: 'object',
            default: ()=> {
                return {
                    keyTakeAways: '',
                    fitCompanyCulture: ''
                }
            }
        },
        score_criteria: {
            type: 'array',
            default: ()=> []
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
        } // schema
    },
    methods: {} // prototype
});

scoreCardModel.prototype.existScoreCard = function (condition) {
    //noinspection JSUnresolvedVariable
    condition = condition || {
            'ref.recruiterId': this.ref.recruiterId,
            'ref.appId': this.ref.appId
        };

    return ScoreCardCollection.findOne(condition);
};

ScoreCard = scoreCardModel;
ScoreCardCollection = scoreCardModel.getCollection();


if (Meteor.isServer) {
    var afterSubmitScoreCardHandler = function (userId, doc) {

        var scoreSummary = SummaryCollection.findOne({
            'ref.appId': doc.ref.appId,
            'ref.type': doc.ref.type
        });

        if (!scoreSummary)
            scoreSummary = new ScoreCardSummary();
        else
            scoreSummary.set('updatedAt', new Date());

        // references

        scoreSummary.set('ref', {
            appId: doc.ref.appId,
            type: doc.ref.type,
            companyId: doc.ref.companyId,
            candidateId: doc.ref.candidateId
        });

        // score_criteria

        var summaryListScore = scoreSummary['all_score_criteria'];

        _.map(doc['score_criteria'], function (val) {
            val.recruiterId = doc['ref'].recruiterId;
            return val;
        }).forEach(function (item) {
            let index = _.findIndex(summaryListScore, {
                recruiterId: item.recruiterId,
                name: item.name,
                type: item.type
            });
            if (index !== -1)
                summaryListScore[index] = item;
            else
                summaryListScore.push(item);
        });


        scoreSummary.set('all_score_criteria', summaryListScore);


        // notes

        var summaryListNotes = scoreSummary['notes'];
        _.map(doc.notes, function (val, key) {
            return {
                type: key,
                content: val,
                recruiterId: doc['ref'].recruiterId
            }
        }).forEach(function (item) {
            let index = _.findIndex(summaryListNotes, {
                type: item.type,
                recruiterId: item.recruiterId
            });
            if (index !== -1)
                summaryListNotes[index] = item;
            else
                summaryListNotes.push(item);
        });

        scoreSummary.set('notes', summaryListNotes);


        // overall

        var overallObj = {
            candidateId: doc['ref'].candidateId,
            value: doc.overall
        };

        var overallList = scoreSummary.overalls;
        let index = _.findIndex(overallList, {candidateId: doc['ref'].candidateId});

        if (index !== -1)
            overallList[index] = overallObj;
        else
            overallList.push(overallObj);

        scoreSummary.set('overalls', overallList);

        scoreSummary.save();
    };

    ScoreCardCollection.after.insert(afterSubmitScoreCardHandler);
    ScoreCardCollection.after.update(afterSubmitScoreCardHandler);

}


// Scorecard summary

var summaryCollection = new Mongo.Collection(SUMMARY_MODULE_NAME);

var summaryModel = Astro.Class({
    name: SUMMARY_MODULE_NAME,
    collection: summaryCollection,
    fields: {
        ref: {
            type: 'object',
            default: ()=> {
                return {
                    appId: null,
                    type: null,
                    companyId: null,
                    candidateId: null
                }
            }
        },
        all_score_criteria: {
            type: 'array',
            default: ()=> [] // { name : '', value :'', recruiterId : '' }
        },
        notes: {
            type: 'array',
            default: ()=> []  // item  :  { type :'' , value : '', recruiterId :''}
        },
        overalls: {
            type: 'array',
            default: ()=> []
        },
        updatedAt: {
            type: 'date',
            default: ()=> {
                new Date();
            }
        }

    }, // schema
    methods: {} // prototype
});

summaryModel.prototype.isExist = function (condition) {
    //noinspection JSUnresolvedVariable
    condition = condition || {
            'ref.recruiterId': this.ref.recruiterId,
            'ref.appId': this.ref.appId,
            'ref.type': this.ref.type
        };

    return SummaryCollection.findOne(condition);
};

ScoreCardSummary = summaryModel;
SummaryCollection = summaryModel.getCollection();






