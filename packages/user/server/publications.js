/**
 * Created by HungNguyen on 8/21/15.
 */


User.publications = {
    pubUserInfo: function (userId, options) {
        var query = (userId) ? {userId: userId} : {};
        return Collection.find(query, options || {});
    }
};