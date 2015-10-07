/**
 * Created by HungNguyen on 8/21/15.
 */

var model = BaseModel.extendAndSetupCollection("applications");

Collection = model.collection;

model.prototype.candidate = function (options) {
    if (this.candidateId == void 0) return [];
    return Meteor.candidates.findOne({candidateId: this.candidateId}, options || {});
};

model.prototype.isExist = function (condition) {
    var query = condition || {entryID: this.entryId};
    return !!Collection.findOne(query);
};

model.appendSchema({
    entryId: {
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
        type: Number,
        optional: true
    },
    source: {
        type: Number
    }, // 1: is online, 2: sent directly, 3: add manually
    stage: {
        type: Number,
        defaultValue: 0
    }, // 1: applied, Default. 2: test assign, 3: Interview, 4: Offer letter, 5: Rejected
    matchingScore: {
        type: Number,
        decimal: true,
        defaultValue: 0
    },
    disqualified: {
        type: Boolean,
        defaultValue: false
    },
    candidateInfo: {
        type: Object,
        blackbox: true,
        optional: true
    },
    isDeleted: {
        type: Number
    },
    vnwData: {
        type: Object,
        blackbox: true

    },
    'vnwData.$.resumeid': {
        type: Number,
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

Application = model;