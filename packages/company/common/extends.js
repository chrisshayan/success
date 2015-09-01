/**
 * Created by HungNguyen on 8/24/15.
 */



User.appendSchema({
    companyId: {type: [{type: String}]}
});


User.prototype.company = function (options) {
    if (this.companyId == void 0) return;
    return Collection.find({companyId: this.userId}, options || {}).fetch();
};


Company.model.prototype.callUpdateInfo = function (info, cb) {
    var company = {
        _id: this._id,
        ownerUserId: this.ownerUserId
    };

    Meteor.call('updateCompanyInfo', company, info, cb);
};

Company.model.prototype.callUpdateCronTime = function (number, cb) {
    var company = {
        _id: this._id,
        ownerUserId: this.ownerUserId
    };

    return Meteor.call('updateCompanyCronTime', company, number, cb);
};

