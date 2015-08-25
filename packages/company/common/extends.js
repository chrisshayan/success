/**
 * Created by HungNguyen on 8/24/15.
 */



User.appendSchema({
    companyId: {type: [{type: String}]}
});


User.prototype.company = function (options) {
    if (this.companyId == void 0) return;
    return Collection.find({companyId: this.companyId}, options || {});
};

