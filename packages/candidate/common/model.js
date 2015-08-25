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
    data: {
        type: Object
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date,
        optional: true
    }

});

Candidate.model = model;

