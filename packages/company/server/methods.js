/**
 * Created by HungNguyen on 8/21/15.
 */

Company.methods = {
    isExist: function (comId) {
        if (!comId) return false;
        return Collection.findOne({companyId: comId});
    },
    updateCompany: function (query, data) {
        return !!(Collection.update(query, data));
    }
};

