/**
 * Created by HungNguyen on 10/8/15.
 */

Template.activeAccount.onCreated(function () {
    var instance = Template.instance();
    instance.props = new ReactiveDict();
    instance.props.set('info', null);
    var params = Router.current().params;
    console.log(params);
    if (params.keyid) {
        Meteor.call('getRequestInfo', params.keyid, function (err, result) {
            if (err) return false;
            console.log('key', result);
            if (result)
                instance.props.set('info', result);

            return {};

        });
    }
});


Template.activeAccount.helpers({
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
