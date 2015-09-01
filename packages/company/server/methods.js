/**
 * Created by HungNguyen on 8/21/15.
 */

function isLoggedIn() {
    if (!Meteor.userId || !Meteor.userId()) return false;
}

var setModifier = function (obj) {
    if (typeof obj !== 'object' || obj.length != void 0) return;
    // remove unchanged field
    delete obj._id;
    delete obj.userId;

    return {'$set ': obj};
};

function updateCompany(query, data) {
    return !!(Collection.update(query, data));
}


var methods = {
    isExist: function (compId) {
        return Collection.findOne({companyId: compId});
    },
    getCompanyInfo: function () {
        isLoggedIn();
        return Meteor.user().company();
    },
    updateCompanyInfo: function (data) {
        isLoggedIn();
        var company = Meteor.user().company();

        if (!data || company.ownedUserId !== Meteor.user().userId) return false;

        var query = {
            _id: company._id
        };
        var modifier = setModifier(data);

        return updateCompany(query, modifier);
    },
    updateCompanyCronTime: function (numberOfMonth) {
        isLoggedIn();
        var company = Meteor.user().company();
        if (!company || numberOfMonth == void 0 || company.ownedUserId !== Meteor.user().userId)
            return false;

        var query = {_id: company._id};
        var modifier = setModifier({amountOfTimeCron: numberOfMonth});

        return updateCompany(query, modifier);
    }
};

Meteor.methods(methods);