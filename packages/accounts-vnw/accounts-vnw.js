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

        var _func = Meteor.wrapAsync(APIS.login);
        var result = _func(data.username, data.password, 1);

        /**
         * Sync data the first time
         */

        if (result && result.success) {
            var data = result.data;
            // Set subscribe userId
            this.setUserId(data.userid + "");
            var user = SYNC_VNW.syncUser(data);

            var tokenData = {
                userId: data.userid,
                companyId: data.companyid,
                expireTime: moment(new Date()).add(1, 'day').valueOf()
            };
            result.token = IZToken.encode(tokenData);
        }
        
        return result;
    },

    onUserReconnect: function (userId) {
        if(!userId) return;
        check(userId, Number);
        var user = Collections.Users.findOne({userId: +userId});
        if(!user)
            return new Meteor.Error(403, "You don't have permission.");

        var tokenData = {
            userId: user.userId,
            companyId: user.companyId,
            expireTime: moment(new Date()).add(1, 'day').valueOf()
        };
        var token = IZToken.encode(tokenData);
        this.setUserId(userId + '');

        return {
            success: true,
            data: user.data,
            token: token
        };
    }
});
