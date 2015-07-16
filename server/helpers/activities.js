Activity = function Activity() {
    this.actionType = "";
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
    APPLIED_JOB: 2
};


Activity.prototype.save = function() {
    this.createdBy = parseInt(this.createdBy);
    var data = {};
    var self = this;
    _.each(Object.keys(self), function(k) {
        data[k] = self[k];
    });
    var result = Collections.Activities.insert(data);

    return result;
}

Activity.prototype.updateApplicationStage = function() {
    this.actionType = this.ACTION_TYPE.UPDATE_APPLICATION_STAGE;
    this.save();
};

Activity.prototype.appliedJob = function() {
    this.actionType = this.ACTION_TYPE.APPLIED_JOB;
    this.save();
}
