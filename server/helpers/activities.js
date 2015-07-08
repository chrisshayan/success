Activity = function Activity() {
    this.actionType = "";
    this.data = {};
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

    var result = Collections.Activities.insert(this);
    if( result ) {
        this.noty(this);
    }
    return result;
}

Activity.prototype.noty = function(data) {
    var self = this;
    Meteor.defer(function() {
        if( data.type == self.ACTION_TYPE.UPDATE_APPLICATION_STAGE ) {
            self.notyMovedStage(data);
        }
    });
}

Activity.prototype.notyMovedStage = function(data) {

}
