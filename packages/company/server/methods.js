/**
 * Created by HungNguyen on 8/21/15.
 */






var methods = {
    updateCompanyInfo: function (company, data) {
        if (Core.isLoggedIn()) return false;

        if (!data || company.ownerUserId !== Meteor.user().userId) return false;

        var query = {
            _id: company._id
        };
        var modifier = Core.setModifier(data);

        return Core.doUpdate(Collection, query, modifier);
    },

    updateCompanyCronTime: function (_id, numberOfMonth) {
        if (isLoggedIn()) return false;

        if (!company || numberOfMonth == void 0 || company.ownerUserId !== Meteor.user().userId)
            return false;

        var query = {_id: _id};
        var modifier = setModifier({amountOfTimeCron: numberOfMonth});

        return Core.doUpdate(Collection, query, modifier);
    }
};

Meteor.methods(methods);