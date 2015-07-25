Meteor.methods({
    /**
     * Login helper
     * @param data {Object}
     * @returns {Object}
     * Object.success {Boolean}
     * Object.msg {String}
     * Object.data {Mixins}
     */
    loginAsEmployer: function (data) {
        check(data.username, String);
        check(data.password, String);
        console.log('startLogin');
        var _func = Meteor.wrapAsync(APIS.login);
        var result = _func(data.username, data.password, 1);
        console.log('endAPI Login');
        /**
         * Sync data the first time
         */

        if (result && result.success) {
            var data = result.data;
            // Set subscribe userId
            this.setUserId(data.userid + "");

            var user = SYNC_VNW.syncUser(data);
            console.log('new', user.isNew);
            //if (data.isNew)
            SYNC_VNW.syncNewLogin(user);

        }
        console.log('out of loginasEmployer');
        return result;
    },

    onUserReconnect: function (userId) {
        this.setUserId(userId + '');
    }
});
