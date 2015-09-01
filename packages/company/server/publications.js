/**
 * Created by HungNguyen on 8/21/15.
 */


Company.publications = {
    pubCompanySettings: function (options) {
        if (this.userId() == void 0) this.ready();

        var query = {ownedUserId: this.user().userId};
        var defaultOptions = {
            limit: 1
        };

        _.extend(defaultOptions, options || {});
        return Collection.find(query, defaultOptions);
    }

};


Meteor.publish('companyInfo', Company.publications.pubCompanySettings);
