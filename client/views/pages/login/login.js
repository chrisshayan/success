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
    },

});

Template.login.events({
    'submit #loginForm': function(e, tmpl) {
        e.preventDefault();

        //change login btn state to loading
        var loginBtn = tmpl.$('#loginBtn');
        loginBtn.button('loading');

        var username = e.target.email.value,
            password = e.target.password.value;
        //
        Meteor.setTimeout(function() {
            Meteor.loginWithVNW(username, password, function(err, result) {
                loginBtn.button('reset');
                if(err) {
                    Session.set("loginErrorMsg", "Your username/password may be incorrect");
                }
            });
        }, 100);
        return false;
    }
})