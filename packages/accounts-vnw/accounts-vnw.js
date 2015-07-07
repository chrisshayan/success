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
        if( result && result.success ) {
            var data = result.data;

            // Set subscribe userId
            this.setUserId(data.userid + "");

            Meteor.defer(function() {
                var _user = Collections.Users.findOne({userId: data.userid});
                if( !_user ) {
                    var _user = new Schemas.User();
                    _user.data = data;
                    _user.userId = _user.data.userid,
                        _user.username = _user.data.username,
                        Collections.Users.insert(_user);
                } else {
                    if( _user.data != data ) {
                        Collections.Users.update(_user._id, {$set: {data: data, lastSyncedAt: new Date()}});
                    }
                }

                //Sync data first time
                SYNC_VNW.pullJobs(_user.userId);
            });
        }
        return result;
    }
});