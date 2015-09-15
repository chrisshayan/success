/**
 * Created by HungNguyen on 8/21/15.
 */

var methods = {
    updateApplications: function (query, options) {
        return Collection.update(query, options || {});
    },
    getApplication: function (query, options) {
        return Collection.find(query, options);
    }
};

Meteor.methods(methods);