/**
 * Created by HungNguyen on 8/21/15.
 */

UserApi.methods = {
    isExist: function (userId) {
        if (!userId) return false;
        return (Collection.findOne({userId: userId}));
    },
    getUser: function (userId) {
        if (!userId) return false;

        return Collections.Users.findOne({userId: +userId});
    },
    updateUser: function (query, data) {
        return !!(Collection.update(query, data));
    },
    findOne: function (query, options) {
        return Collection.findOne(query, options || {});
    },
    find: function (query, options) {
        return Collection.find(query, options || {}).fetch();
    }
};