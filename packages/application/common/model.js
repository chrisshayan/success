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

model.prototype.link = function () {
    var job = Meteor['jobs'].findOne({jobId: this.jobId});

    var params = {
        _id: job._id,
        stage: Success.APPLICATION_STAGES[this.stage].alias
    };
    var queryParams = {
        query: {
            application: this._id
        }
    };
    return Router.url('Job', params, queryParams)
};


model.prototype.matchingScoreLabel = function () {
    var matchingScore = this.matchingScore;
    if (matchingScore >= 90)
        return " label-success ";
    if (matchingScore >= 70)
        return " label-primary ";
    if (matchingScore >= 50)
        return " label-warning ";
    if (!matchingScore || matchingScore <= 0)
        return " hidden ";

    return " label-default ";
};

model.prototype.timeago = function () {
    return moment(this.createdAt).fromNow();
};

model.prototype.vnwProfileLink = function () {
    var queryParams = "";
    if (this.source.type == 3) {
        return "";
    } else if (this.source.type == 1) {
        queryParams = "?jobid=%s&appid=%s";
    } else {
        queryParams = "?jobid=%s&sdid=%s";
    }

    var url = Meteor.settings.public.applicationUrl;
    return url + sprintf(queryParams, this.jobId, this.entryId);
};

model.prototype.isSentDirectly = function () {
    return this.source.type === 2;
};


model.appendSchema({
    entryId: {
        type: Number,
        optional: true
    },
    /*jobId: {
     type: Number,
     optional: true
     },*/
    source: {
        type: Object,
        blackbox: true,
        optional: true
    }, // 1: applied, Default. 2: test assign, 3: Interview, 4: Offer letter, 5: Rejected
    /*    sourceId: {
     type: Number,
     optional: true
     },*/
    candidateId: {
        type: String,
        optional: true
    },
    companyId: {
        type: Number
    },
    resumeId: {
        type: Number,
        optional: true
    },
    /*source: {
     type: Number
     }, // 1: is online, 2: sent directly, 3: add manually*/
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
    coverLetter: {
        type: String,
        optional: true
    },
    isDeleted: {
        type: Number
    },
    /*vnwData: {
     type: Object,
     blackbox: true,
     optional: true

     },*/
    createdAt: {
        type: Date,
        defaultValue: new Date()
    },
    updatedAt: {
        type: Date,
        optional: true
    }

});

Application = model;