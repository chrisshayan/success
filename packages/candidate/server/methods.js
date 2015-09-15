/**
 * Created by HungNguyen on 8/21/15.
 */

var methods = {
    updateCandidate: function (query, data) {
        if (!data || typeof data !== 'object') return;
        return Collection.update(query, data);
    },
    getConfig: function (name) {
        return CONFIG[name];
    }
};

Meteor.methods(methods);