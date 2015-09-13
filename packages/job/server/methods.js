/**
 * Created by HungNguyen on 8/21/15.
 */

var methods = {
    updateJob: function (query, data) {
        return !!(Collection.update(query, data));
    }
};

Meteor.methods(methods);

