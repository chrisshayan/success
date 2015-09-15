/**
 * Created by HungNguyen on 8/21/15.
 */


var publications = {
    oldPubCompanySettings: function (options) {
        console.log('this', this.userId);
        if (this.userId == void 0) return null;

        var user = Meteor.call('getUser', this.userId);
        var defaultOptions = {
            limit: 1
        };
        var query = {};
        if (user == void 0)
            query.companyId = user.companyId;

        _.extend(defaultOptions, options || {});
        return Collection.find(query, defaultOptions);

    },
    pubCompanySettings: function (options) {
        console.log('this', this.userId);
        if (this.userId == void 0) return null;
        var query = {createdBy: this.userId};
        var defaultOptions = {
            limit: 1
        };

        _.extend(defaultOptions, options || {});
        return Collection.find(query, defaultOptions);
    }

};


/*Meteor.publish('companyInfo', publications.oldPubCompanySettings);

 Meteor.publish('companySettings', publications.oldPubCompanySettings);*/
