Activity = function Activity() {
    this.actionType = "";
    this.application = {};
    this.createdAt = new Date();
    this.createdBy = null;
};

Activity.prototype.ACTION_TYPE = {
    UPDATE_APPLICATION_STAGE: 1
};

Activity.prototype.updateApplicationStage = function() {
    this.actionType = this.ACTION_TYPE.UPDATE_APPLICATION_STAGE;
    this.save();
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

Activity.prototype.noty = function(data) {
    var self = this;
    Meteor.defer(function() {
        if( data.actionType == self.ACTION_TYPE.UPDATE_APPLICATION_STAGE ) {
            self.notyMovedStage(data);
        }
    });
}
//
//Activity.prototype.notyMovedStage = function(data) {
//    var mailTemplate = Collections.MailTemplates.findOne({fromStage: data.data.fromStage, toStage: data.data.toStage});
//    if(!mailTemplate || !mailTemplate.emailFrom)
//        return;
//    var job = Collections.Candidates.findOne({userId: data.data.jobId});
//    var application = Collections.Candidates.findOne({entryId: data.data.applicationId});
//    var candidate = Collections.Candidates.findOne({userId: data.data.candidateId});
//
//    var from = mailTemplate.emailFrom;
//    var to = candidate.data.username;
//    Meteor.Mandrill.send({
//        from: from,
//        to: to,
//        subject: mailTemplate.subject,
//        html: mailTemplate.htmlBody
//    });
//}
