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
                    _user.userId = _user.data.userid;
                    _user.username = _user.data.username;
                    Collections.Users.insert(_user);

                    //Intitial user data
                    Meteor.defer(function() {
                        initialEmployerData(data.userid);
                    });
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
    },

    onUserReconnect: function(userId) {
        this.setUserId(userId + '');
    }
});


var initialEmployerData = function(userId) {
    check(userId, Number);

    var defaultMailTemplates = [
        {
            name: "From applied to Test assign",
            fromStage: 1,
            toStage: 2,
            type: 1,
            emailFrom: "",
            subject: "From applied to Test assign",
            htmlBody: "<h2>Test From applied to Test assign</h2>"
        },{
            name: "From applied to Test assign",
            fromStage: 2,
            toStage: 3,
            type: 1,
            emailFrom: "",
            subject: "From applied to Test assign",
            htmlBody: "<h2>Test From applied to Test assign</h2>"
        },{
            name: "From applied to Test assign",
            fromStage: 3,
            toStage: 4,
            type: 1,
            emailFrom: "",
            subject: "From applied to Test assign",
            htmlBody: "<h2>Test From applied to Test assign</h2>"
        },{
            name: "From applied to Test assign",
            fromStage: 3,
            toStage: 5,
            type: 1,
            emailFrom: "",
            subject: "From applied to Test assign",
            htmlBody: "<h2>Test From applied to Test assign</h2>"
        },
    ];
    _.each(defaultMailTemplates, function(tmpl) {
        var template = new Schemas.MailTemplate();
        template.modifiedBy = template.createdBy = userId;
        template = _.extend(template, tmpl);
        Collections.MailTemplates.insert(template);
    });

    // 1: applied, Default. 2: test assign, 3: Interview, 4: Offer letter, 5: Rejected
}