/**
 * Created by HungNguyen on 8/24/15.
 */



Company.prototype.job = function (options) {
    if (this.companyId == void 0) return [];
    return Collection.find({companyId: this.companyId}, options || {}).fetch();
};

User.prototype.job = function (options) {
    if (this.email == void 0) return [];
    return Collection.find({jobEmailTo: this.email}, options || {}).fetch();
};

User.prototype.callUpdateCustomJob = function (data, cb) {
    return Meteor.call('updateCustomJob', this.jobId, data, cb);
};