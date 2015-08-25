/**
 * Created by HungNguyen on 8/21/15.
 */

var model = BaseModel.extendAndSetupCollection("applications");

Collection = model.collection;

model.appendSchema({
    jobId: {type: Number},
    entryId: {type: Number},
    candidateId: {type: Number},
    companyId: {type: Number},
    coverLetter: {
        type: String,
        defaultValue: ''
    },
    resumeId: {
        type: Number
    },
    source: {type: Number}, // 1: is online, 2: sent directly, 3: add manually
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
    data: {type: Object},
    createdAt: {type: Date},
    updatedAt: {type: Date, optional: true}

});

Application.model = model;