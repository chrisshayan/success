/**
 * Created by HungNguyen on 8/21/15.
 */


Company.publications = {
    pubCompanySettings: function (companyId, options) {
        var query = (companyId) ? {companyId: companyId} : {};
        var defaultOptions = {
            limit: 1
        };
        _.extend(defaultOptions, options);

        return Collection.find(query, defaultOptions);
    }

};
