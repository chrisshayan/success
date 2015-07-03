Session.setDefault('loginErrorMsg', "");

Template.login.helpers({

    /**
     * check login status
     * return {Boolean}
     */
    isError: function() {
        return !!Session.get("loginErrorMsg")
    },

    /**
     * get error string
     * @returns {String}
     */
    errorMsg: function() {
        return Session.get("loginErrorMsg");
    }

});

Template.login.events({
    'submit #loginForm': function(e, tmpl) {
        //change login btn state to loading
        var loginBtn = tmpl.$('#loginBtn');
        loginBtn.button('loading');
        //
        var account = {
            username: e.target.email.value,
            password: e.target.password.value
        };

        Meteor.call('login', account, function(err, result) {
            //reset login button state
            loginBtn.button('reset');

            if(!err) {
                if( !result.success ) {
                    Session.set("loginErrorMsg", result.msg);
                } else {
                    Session.set("loginErrorMsg", "");
                    Router.go("dashboard");
                }
            }
        });
        return false;
    }
})