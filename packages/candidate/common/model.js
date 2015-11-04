/**
 * Created by HungNguyen on 8/21/15.
 */

var model = BaseModel.extendAndSetupCollection("candidates");

Collection = model.collection;

model.prototype.isExist = function (condition) {
    var query = condition || {candidateId: this.candidateId};
    return !!Collection.findOne(query);
};


model.appendSchema({
    candidateId: {
        type: Number,
        optional: true
    },
    username: {
        type: String,
        optional: true
    },
    password: {
        type: String,
        optional: true
    },
    email: {
        type: String,
        optional: true
    },
    email1: {
        type: String,
        optional: true
    },
    email2: {
        type: String,
        optional: true
    },
    source: {
        type: Object,
        blackbox: true,
        optional: true
    },
    data: {
        type: Object,
        blackbox: true,
        optional: true
    },
    firstname: {
        type: String,
        optional: true
    },
    lastname: {
        type: String,
        optional: true
    },
    genderId: {
        type: Number,
        optional: true
    },
    jobTitle: {
        type: String,
        optional: true
    },
    workingCompany: {
        type: String,
        optional: true
    },
    /*data: {
     type: Object,
     blackbox: true
     },
     vnwData: {
     type: Object,
     blackbox: true
     },*/
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date,
        optional: true
    }

});

Candidate = model;

