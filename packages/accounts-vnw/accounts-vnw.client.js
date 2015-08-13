AccountsVNW = {};
AccountsVNW._store = ReactiveCookie;
AccountsVNW._loggingIn = new ReactiveVar(false);
AccountsVNW._loginDuration = Meteor.settings.public.loginDuration || {days: 1};
AccountsVNW._connection = Meteor.connection;
AccountsVNW._isShowMyJobs = new ReactiveVar(true);
AccountsVNW._recruiterEmail = new ReactiveVar("");

AccountsVNW._setUserLogin = function (user) {
    AccountsVNW._store.set('user', EJSON.stringify(user), this._loginDuration);
    AccountsVNW.initUserLogin();
};


AccountsVNW._setLoginToken = function (token) {
    AccountsVNW._store.set('loginToken', token, this._loginDuration);
};

AccountsVNW.initUserLogin = function () {

    var _user = AccountsVNW.user();
    if (_user) {
        AccountsVNW._connection.setUserId(_user.userid);
        Meteor.call('onUserReconnect', _user.userid, AccountsVNW.onReconnect);
        AccountsVNW._connection.onReconnect = function () {
            Meteor.call('onUserReconnect', _user.userid, AccountsVNW.onReconnect);

        };
    }
};

AccountsVNW.onReconnect = function (err, result) {
    if (err) throw err;
    AccountsVNW._store.set('user', EJSON.stringify(result.data), this._loginDuration);
    AccountsVNW._setLoginToken(result.token);
};

Meteor.startup(function () {
    var isShowMyJobs = AccountsVNW._store.get('showMyJob');
    var recruiterEmail = AccountsVNW._store.get('recruiterEmail');

    if (recruiterEmail)
        recruiterEmail = EJSON.parse(recruiterEmail);
    else
        isShowMyJobs = false;

    isShowMyJobs = (!recruiterEmail) ? false : (isShowMyJobs + '' !== 'false');
    AccountsVNW._isShowMyJobs.set(isShowMyJobs);
    AccountsVNW._recruiterEmail.set(recruiterEmail);

});


/**
 * Login service with Employer account
 * @param username {String}
 * @param password {String}
 * @param callback {Function}
 */
AccountsVNW.loginAsEmployer = function (username, password, callback) {
    AccountsVNW._loggingIn.set(true);

    var _account = {username: username, password: password};
    Meteor.call('loginAsEmployer', _account, function (err, result) {
        AccountsVNW._loggingIn.set(false);

        if (!err) {
            if (result.success) {
                AccountsVNW._setUserLogin(result.data);
                //AccountsVNW._setLoginToken(result.token);
                callback && callback(result);
            } else {
                callback && callback(result);
            }
        } else {
            callback && callback(err);
        }
    });
};

/**
 * NO IMPLEMENT
 * Login service with JobSeeker account
 * @param username
 * @param password
 * @param callback
 */
AccountsVNW.loginAsJobSeeker = function (username, password, callback) {

};
/**
 * Get user logged in
 * @returns {*}
 */
AccountsVNW.user = function () {
    var _user = AccountsVNW._store.get('user');
    return _user ? EJSON.parse(_user) : undefined;
};

AccountsVNW.userId = function () {
    return AccountsVNW.user() ? AccountsVNW.user().userid : undefined;
};

AccountsVNW.loggingIn = function () {
    return AccountsVNW._loggingIn.get();
};

AccountsVNW.logout = function () {
    AccountsVNW._store.clearAll();
    AccountsVNW._connection.setUserId(null);
    AccountsVNW._isShowMyJobs.set('false');
    AccountsVNW._recruiterEmail.set(null);
    AccountsVNW._connection.onReconnect = null;
};

AccountsVNW.loginToken = function () {
    return AccountsVNW._store.get('loginToken') || undefined;
};


AccountsVNW.setRecruiterEmail = function (email) {
    AccountsVNW._store.set('recruiterEmail', EJSON.stringify(email));
    AccountsVNW._recruiterEmail.set(email);
};


AccountsVNW.setShowMyJob = function (status) {
    AccountsVNW._store.set('showMyJob', status);
    AccountsVNW._isShowMyJobs.set(status);
};

AccountsVNW.currentRecruiter = function () {
    var obj = {};

    try {
        obj.email = AccountsVNW._recruiterEmail.get();
        obj.showMyJob = (!obj.email) ? false : AccountsVNW._isShowMyJobs.get();

    } catch (e) {
        console.log(e);
        debuger(e);
    }

    return obj;
};
AccountsVNW.getEmailList = function () {
    Meteor.call('getEmailList', function (err, result) {
        return result;
    });
};
