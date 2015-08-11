AccountsVNW = {}
AccountsVNW._store = ReactiveCookie;
AccountsVNW._loggingIn = new ReactiveVar(false);
AccountsVNW._loginDuration = Meteor.settings.public.loginDuration || {days: 1};
AccountsVNW._connection = Meteor.connection;

AccountsVNW._setUserLogin = function(user) {
    AccountsVNW._store.set('user', EJSON.stringify(user), this._loginDuration);
    AccountsVNW.initUserLogin();
};

AccountsVNW._setLoginToken = function(token) {
    AccountsVNW._store.set('loginToken', token, this._loginDuration);
}

AccountsVNW.initUserLogin = function() {
    var _user = AccountsVNW.user();
    if( _user ) {
        AccountsVNW._connection.setUserId(_user.userid);
        Meteor.call('onUserReconnect', _user.userid, AccountsVNW.onReconnect);
        AccountsVNW._connection.onReconnect = function() {
            Meteor.call('onUserReconnect', _user.userid, AccountsVNW.onReconnect);
        };
    }
};

AccountsVNW.onReconnect = function(err, result) {
    if(err) throw err;
    AccountsVNW._store.set('user', EJSON.stringify(result.data), this._loginDuration);
    AccountsVNW._setLoginToken(result.token);
}


/**
 * Login service with Employer account
 * @param username {String}
 * @param password {String}
 * @param callback {Function}
 */
AccountsVNW.loginAsEmployer = function (username, password, callback) {
    AccountsVNW._loggingIn.set(true);

    var _account = {username: username, password: password};
    Meteor.call('loginAsEmployer', _account, function(err, result) {
        AccountsVNW._loggingIn.set(false);

        if(!err) {
            if( result.success ) {
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

}
/**
 * Get user logged in
 * @returns {*}
 */
AccountsVNW.user = function() {
    var _user = AccountsVNW._store.get('user');
    return  _user ? EJSON.parse(_user) : undefined;
}

AccountsVNW.userId = function() {
    return AccountsVNW.user() ? AccountsVNW.user().userid : undefined;
}

AccountsVNW.loggingIn = function() {
    return AccountsVNW._loggingIn.get();
}

AccountsVNW.logout = function() {
    AccountsVNW._store.clear('user');
    AccountsVNW._store.clear('loginToken');
    AccountsVNW._connection.setUserId(null);
    AccountsVNW._connection.onReconnect = null;
}

AccountsVNW.loginToken = function() {
    return  AccountsVNW._store.get('loginToken') || undefined;
}