/**
 * Created by HungNguyen on 8/24/15.
 */


User.prototype.callUpdateEmailSignature = function (newSignature, cb) {
    return Meteor.call('updateEmailSignature', newSignature, cb);
};
