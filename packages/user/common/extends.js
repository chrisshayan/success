/**
 * Created by HungNguyen on 8/24/15.
 */


Meteor.loginWithVNW = function (email, password, callback) {
    // login: 1
    Meteor.loginWithPassword({email: email}, password, function (err, result) {
        if (err) {
            // update vnw account
            Meteor.call('loginWithVNW', email, password, function (err, result) {
                if (err) throw err;
                // login: 2
                Meteor.loginWithPassword({email: email}, password, function (err, result) {
                    callback && callback(err, result);
                });
            });
        }
    });
};

User.prototype.updateEmailSignature = function (newSignature, cb) {
    return Meteor.call('updateEmailSignature', newSignature, cb);
};

User.prototype.updateUserInfo = function (data, cb) {
    return Meteor.call('updateUserInfo', data, cb);
};
