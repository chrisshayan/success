/**
 * Created by HungNguyen on 8/21/15.
 */

UserApi.methods = {
    isExist: function (userId) {
        if (!userId) return false;
        return (Collection.findOne({userId: userId}));
    },
    updateUser: function (query, options) {
        return !!(Collection.update(query, options));
    },
    findOne: function (query, options) {
        return Collection.findOne(query, options || {});
    },
    find: function (query, options) {
        return Collection.find(query, options).fetch();
    }
};