/**
 * Created by HungNguyen on 10/8/15.
 */

AutoForm.hooks({
    activeAccountForm: {
        onSubmit(doc) {
            Meteor.call('activeAccount', doc, function (err, userId) {
                if (err) {
                    console.log('Error %s :  %s', err.err, err.message);
                    return false;
                }

                if (userId) {
                    Meteor.loginWithPassword(doc.email, doc.password, function (err, result) {
                        if (err) throw err;
                        Router.go('dashboard');
                    });
                }
            });
            return false;
        }
    }
});

SimpleSchema.messages({
    "notAvailableUsername": "This username isn't available."
});

Template.activeAccount.onCreated(function () {
    var instance = Template.instance();
    instance.props = new ReactiveDict();
    instance.props.set('info', null);
    var params = Router.current().params;
    if (params.keyid) {
        Meteor.call('getRequestInfo', params.keyid, function (err, result) {
            if (err) throw err;
            if (result)
                instance.props.set('info', result);

            return {};

        });
    }
});


Template.activeAccount.helpers({
    schema: function () {
        var data = Template.instance().props.get('info');
        var _Schema = new SimpleSchema({
            emailText: {
                type: String,
                label: 'Email',
                defaultValue: data.email,
                autoform: {
                    disabled: true
                }
            },
            email: {
                type: String,
                defaultValue: data.email,
                autoform: {
                    type: 'hidden'
                }
            },
            key: {
                type: String,
                defaultValue: data._id,
                autoform: {
                    type: 'hidden'
                }
            },
            fullname: {
                type: 'string',
                autoform: {
                    value: data.name
                }
            },
            username: {
                type: 'string',
                custom: function () {
                    if (Meteor.isClient && this.isSet) {
                        console.log('active username validate', this.value);
                        Meteor.call("validateUserLoginInfo", this.value, function (error, result) {
                            //console.log('re user', result);
                            if (result)
                                _Schema.namedContext("activeAccountForm").addInvalidKeys([{
                                    name: "username",
                                    type: "notAvailableUsername"
                                }]);

                        });
                    }
                },
                autoform: {
                    value: data.username
                }
            },
            password: {
                type: 'string',
                autoform: {
                    type: 'password'
                }
            }
        });

        return _Schema;
    },
    info: function () {
        return Template.instance().props.get('info');
    }
});


/*
 Meteor.call('getRequestInfo', params.keyid, function (err, userInfo) {
 if (err) return false;
 console.log(userInfo);
 if (!userInfo) {
 self.response.end();
 }
 var tempName = userInfo.split(' ');
 var firstName = tempName.shift();
 var lastName = tempName.join(' ');
 var user = {};
 user.username = userInfo.email;
 user.password = 'defaultpwd';
 user.userId = userInfo.userId;

 user.profile = {
 firstname: firstName,
 lastname: lastName
 };

 Accounts.createUser(user, function (err, result) {
 if (err) throw err;

 if (result) {
 //login-user
 var loggedIn = '';
 if (loggedIn) {
 var url = Meteor.absoluteUrl('/account/update');
 self.response.writeHead(301, {
 Location: url
 });
 self.response.end();
 } else {
 self.response.end();
 }
 } else {

 }
 });

 });*/
