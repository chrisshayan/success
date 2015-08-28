/**
 * Created by HungNguyen on 8/21/15.
 */

var model = BaseModel.extendAndSetupCollection("vnw_resumes");

Collection = model.collection;


model.prototype.candidate = function (options) {
    if (this.candidateId == void 0) return [];
    return Candidate.model._collection.find({candidateId: this.candidateId}, options || {}).fetch();
};

model.appendSchema({
    resumeId: {
        type: Number
    },
    candidateId: {
        type: Number
    },
    vnwData: {
        type: Object,
        blackbox: true
    },
    'vnwData.$.resumeid': {
        type: String,
        optional: true
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }

});

Resume.model = model;