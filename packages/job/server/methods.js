/**
 * Created by HungNguyen on 8/21/15.
 */

function doAuthorize(query) {
    var companyId = Meteor.user().companyId;
    var job = Collection.findOne(query);
    // authorize before update
    if (companyId !== job.companyId) return false;
}

function isLoggedIn() {
    if (!Meteor.userId || !Meteor.userId()) return false;
}

function setModifier(obj) {
    if (typeof obj !== 'object' || obj.length != void 0) return;
    // remove unchanged field
    delete obj._id;
    delete obj.userId;

    return {'$set ': obj};
}

function updateJob(query, data) {
    doAuthorize(query);

    return !!(Collection.update(query, data));
}

var methods = {
    updateCustomJob: function (jobId, data) {
        isLoggedIn();
        if (jobId == void 0) return;

        var query = {jobId: jobId};
        var modifier = setModifier(data);

        return updateJob(query, modifier);
    }
};


Meteor.methods(methods);

