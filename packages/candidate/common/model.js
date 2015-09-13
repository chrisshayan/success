/**
 * Created by HungNguyen on 8/21/15.
 */

var model = BaseModel.extendAndSetupCollection("candidates");

Collection = model.collection;

model.appendSchema({
    candidateId: {
        type: Number
    },
    username: {
        type: String
    },
    password: {
        type: String
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    jobTitle: {
        type: String,
        optional: true
    },
    workingCompany: {
        type: String,
        optional: true
    },
    vnwData: {
        type: Object,
        blackbox: true
    },
    'vnwData.$.username': {
        type: String,
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

Candidate = model;

