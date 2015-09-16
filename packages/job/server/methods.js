/**
 * Created by HungNguyen on 8/21/15.
 */


var methods = {
    updateJob: function (job, data) {
        if (Core.isLoggedIn()) return false;

        if (!data) return false;

        var query = {
            _id: job._id
        };
        var modifier = Core.setModifier(data);

        return Core.doUpdate(Collection, query, modifier);
    },

    publishPosition: function (doc) {
        console.log(doc);
    }
};


Meteor.methods(methods);
