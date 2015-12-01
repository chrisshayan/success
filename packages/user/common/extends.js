/**
 * Created by HungNguyen on 8/24/15.
 */


Meteor.loginWithVNW = function (email, password, callback) {
    // login: 1
    Meteor.loginWithPassword({email: email}, password, function (err, result) {
        if (err) {
            // update vnw account
            Meteor.call('loginWithVNW', email, password, function (err, result) {
                if (err) throw err;
                // login: 2
                Meteor.loginWithPassword({email: email}, password, function (err, result) {
                    //setup hiring team
                    Meteor.call('setupDefaultHiringTeam');
                    callback && callback(err, result);
                });
            });
        }
    });
};

Meteor.currentRecruiter = function () {
    return {
        email: ""
    }
};
User.prototype.fullname = function () {
    var fullname = '';
    var profile = this.profile || null;
    if (profile) {
        fullname = [profile.firstname, profile.lastname].join(' ');
    }
    return fullname;
}

User.prototype.isCompanyAdmin = function () {
    return this.roles && this.roles.indexOf(UserApi.ROLES.COMPANY_ADMIN) >= 0;
};


User.prototype.updateEmailSignature = function (newSignature, cb) {
    return Meteor.call('updateEmailSignature', newSignature, cb);
};

User.prototype.updateUserInfo = function (data, cb) {
    return Meteor.call('updateUserInfo', data, cb);
};

User.prototype.defaultCompany = function () {
    if (this.roles && this.roles.indexOf(UserApi.ROLES.COMPANY_ADMIN) >= 0) {
        return Collections.CompanySettings.findOne({companyId: this.companyId});
    }
    var hiringTeam = Meteor.hiringTeam.findOne({userId: this._id, status: 1});
    if (hiringTeam) {
        return Collections.CompanySettings.findOne({companyId: hiringTeam.companyId});
    }
    return false;
};

