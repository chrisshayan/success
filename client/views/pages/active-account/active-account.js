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
                //console.log(userId);
                if (userId) {
                    if (doc.password)
                        Meteor.loginWithPassword(doc.email, doc.password, function (err, result) {
                            if (err) throw err;
                            Router.go('dashboard');
                        });
                    else
                        Router.go('login');
                }
            });
            return false;
        }
    }
});

SimpleSchema.messages({
    "notAvailableUsername": "This username isn't available.",
    "usernameisnotvalid": "this username is  invalid. Only characters, numbers and '.' are allowed."
});

Template.activeAccount.onCreated(function () {
    var instance = Template.instance();
    instance.props = new ReactiveDict();
    instance.props.set('info', null);

    var params = Router.current().params;
    if (params.keyid) {
        Meteor.call('getRequestInfo', params.keyid, function (err, result) {
            if (err) throw err;
            //console.log('result', result);

            if (result.hiringTeamInfo) {
                instance.props.set('info', result.hiringTeamInfo);
                instance.props.set('isExistRecruiter', !!result.isExistUser);
            }

            return {};
        });


    }
});


Template.activeAccount.helpers({
    schema: function () {
        var instance = Template.instance()
            , _Schema = '';

        var data = instance.props.get('info')
            , isexistRecruiter = instance.props.get('isExistRecruiter');
        console.log(isexistRecruiter);

        if (!isexistRecruiter) {
            _Schema = new SimpleSchema({
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
                            Meteor.call("validateUserLoginInfo", this.value, function (error, result) {
                                //console.log('re user', error, result);
                                switch (result) {
                                    case 0 :
                                        break;
                                    case 1 :
                                        _Schema.namedContext("activeAccountForm").addInvalidKeys([{
                                            name: "username",
                                            type: "notAvailableUsername"
                                        }]);
                                        break;
                                    case 2 :
                                    default:
                                        _Schema.namedContext("activeAccountForm").addInvalidKeys([{
                                            name: "username",
                                            type: "usernameisnotvalid"
                                        }]);
                                        break;
                                }

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

        } else {
            _Schema = new SimpleSchema({
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
                    type: String,
                    autoform: {
                        value: data.name
                    }
                },
                usernameText: {
                    type: String,
                    label: 'Username',
                    defaultValue: data.username,
                    autoform: {
                        disabled: true
                    }
                },
                username: {
                    type: String,
                    defaultValue: data.username,
                    autoform: {
                        type: 'hidden'
                    }
                }
            });
        }
        return _Schema;
    },
    existUserSchema: function () {
        var data = Template.instance().props.get('info');

        return _Schema;
    }
    ,

    info: function () {
        return Template.instance().props.get('info');
    }
    ,

    existUser: function () {
        var params = Router.current().params;
        return params.isExist === 1;
    }
})
;


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
