/**
 * Created by HungNguyen on 8/21/15.
 */

var model = BaseModel.extendAndSetupCollection("candidates");

Collection = model.collection;

model.prototype.isExist = function (condition) {
    var query = condition || {candidateId: this.candidateId};
    return !!Collection.findOne(query);
};


model.prototype.updateCandidate = function (data, cb) {
    if (data == void 0 || typeof data === 'function') data = this;

    return Meteor.call('updateCandidate', this, data, cb);
};

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
        type: String,
        optional: true
    },
    lastname: {
        type: String,
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

