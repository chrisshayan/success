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


function updateUser(query, data) {
    return !!(Collection.update(query, data));
}

var methods = {
    isExist: function (userId) {
        if (!userId) return false;
        return (Collection.findOne({userId: +userId}));
    },

    updateEmailSignature: function (newSignature) {
        isLoggedIn();
        if (!newSignature) return false;

        var query = {
            _id: Meteor.userId()
        };
        var modifier = setModifier({emailSignature: newSignature});

        return updateUser(query, modifier);
    },

    updateUserInfo: function (data) {
        isLoggedIn();

        var query = {
            _id: Meteor.userId()
        };

        var modifier = setModifier(data);

        return updateUser(query, modifier);
    }
};


Meteor.methods(methods);
