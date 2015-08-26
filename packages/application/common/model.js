/**
 * Created by HungNguyen on 8/21/15.
 */

var model = BaseModel.extendAndSetupCollection("applications");

Collection = model.collection;

model.prototype.candidate = function (options) {
    if (this.candidateId == void 0) return [];
    return Candidate.model._collection.find({candidateId: this.candidateId}, options || {});
};

model.appendSchema({
    applicationId: {
        type: Number
    },
    jobId: {
        type: Number
    },
    candidateId: {
        type: Number
    },
    companyId: {
        type: Number
    },
    coverLetter: {
        type: String,
        defaultValue: ''
    },
    resumeId: {
        type: Number
    },
    source: {
        type: Number
    }, // 1: is online, 2: sent directly, 3: add manually
    stage: {
        type: Number
        , defaultValue: 0
    }, // 1: applied, Default. 2: test assign, 3: Interview, 4: Offer letter, 5: Rejected
    matchingScore: {
        type: Number,
        defaultValue: 0
    },
    disqualified: {
        type: Boolean,
        defaultValue: false
    },
    vnwData: {
        type: Object,
        optional: true
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date,
        optional: true
    }

});

Application.model = model;