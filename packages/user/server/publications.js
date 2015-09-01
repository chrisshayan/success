/**
 * Created by HungNguyen on 8/21/15.
 */


UserApi.publications = {
    pubUserInfo: function (userId, options) {
        if (this.userId() == void 0) this.ready();
        var query = (userId) ? {userId: userId} : {};

        return Collection.find(query, options || {});
    }
};


Meteor.publish('userInfo', UserApi.publications.pubUserInfo);