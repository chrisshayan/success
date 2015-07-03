Meteor.methods({
    /**
     * Login helper
     * @param data {Object}
     * @returns {Object}
     * Object.success {Boolean}
     * Object.msg {String}
     * Object.data {Mixins}
     */
    login: function (data) {
        check(data.username, String);
        check(data.password, String);
        var _func = Meteor.wrapAsync(APIS.login);
        return _func(data.username, data.password);
    }
});