/**
 * Created by HungNguyen on 8/24/15.
 */



Company.model.prototype.job = function (options) {
    if (this.companyId == void 0) return [];
    return Collection.find({companyId: this.companyId}, options || {});
};


User.prototype.job = function (options) {
    if (this.email == void 0) return [];
    return Collection.find({jobEmailTo: this.email}, options || {})
};