Activity = function Activity() {
    this.actionType = "";
    this.companyId = null;
    this.data= {};
    this.createdAt = new Date();
    this.createdBy = null;
};

/**
 * ENUM ACTION TYPE
 * @type {{UPDATE_APPLICATION_STAGE: number, APPLIED_JOB: number}}
 */
Activity.prototype.ACTION_TYPE = {
    UPDATE_APPLICATION_STAGE: 1,
    APPLIED_JOB: 2,
    DISQUALIFIED_APPLICATION: 3,
    REVERT_APPLICATION: 4,
    SEND_MAIL_TO_CANDIDATE: 5,
    ADD_COMMENT_TO_APPLICATION: 6,
    ADD_CANDIDATE_TO_SOURCED: 7,
};


Activity.prototype.save = function() {
    if(!this.companyId) {
        return false;
    }

    var data = {};
    var self = this;
    _.each(Object.keys(self), function(k) {
        data[k] = self[k];
    });

    return Collections.Activities.insert(data);
};

Activity.prototype.updateApplicationStage = function() {
    this.actionType = this.ACTION_TYPE.UPDATE_APPLICATION_STAGE;
    this.save();
};

Activity.prototype.appliedJob = function() {
    this.actionType = this.ACTION_TYPE.APPLIED_JOB;
    this.save();
};


Activity.prototype.disqualifiedApplication = function() {
    this.actionType = this.ACTION_TYPE.DISQUALIFIED_APPLICATION;
    this.save();
}


Activity.prototype.revertApplication = function() {
    this.actionType = this.ACTION_TYPE.REVERT_APPLICATION;
    this.save();
}

Activity.prototype.sendMailToCandidate = function() {
    this.actionType = this.ACTION_TYPE.SEND_MAIL_TO_CANDIDATE;
    this.save();
}

Activity.prototype.addCommentApplication = function() {
    this.actionType = this.ACTION_TYPE.ADD_COMMENT_TO_APPLICATION;
    this.save();
}
Activity.prototype.addCandidateToSourced = function() {
    this.actionType = this.ACTION_TYPE.ADD_CANDIDATE_TO_SOURCED;
    this.save();
}

