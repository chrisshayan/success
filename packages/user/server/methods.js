/**
 * Created by HungNguyen on 8/21/15.
 */

VNW_QUERIES = Meteor.settings.queries;

function hashVNWPassword(password) {
    var crypto = Npm.require('crypto');
    var hash = crypto.createHash(Meteor.settings.private.passwordHash);
    hash.update(password);
    return hash.digest('hex');
}

var setModifier = function (obj) {
    if (typeof obj !== 'object' || obj.length != void 0) return;
    // remove unchanged field
    delete obj._id;
    delete obj.userId;

    return {'$set': obj};
};


function generateUsername(userId) {
    if (!userId) return null;

    var regEx = new RegExp('^' + userId, 'i');
    var similarLength = Meteor.users.find({username: regEx}).count();
    if (similarLength) {
        userId += similarLength;
    }
    return userId.toLowerCase();
}

function generateName(name) {
    if (!name) return '';

    return name.replace(/[_\.\d]/g, ' ').trim().split(' ').map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}


function updateUser(query, data) {
    return !!(Collection.update(query, data));
}

var methods = {
    updateEmailSignature: function (newSignature) {
        isLoggedIn();
        if (!newSignature) return false;

        var query = {
            _id: Meteor.userId()
        };
        var modifier = setModifier({emailSignature: newSignature});

        return updateUser(query, modifier);
    },

    updateUserInfo: function (data) {
        isLoggedIn();

        if (data == void 0) return false;

        var query = {
            _id: Meteor.userId()
        };

        var modifier = setModifier(data);

        return updateUser(query, modifier);
    },

    loginWithVNW: function (email, password) {
        check(email, String);
        check(password, String);
        /**
         * 1) user existing in Success -> return true -> client will call login with password
         * 2) user does not exists in Success -> get account from vnw -> client call login with password
         * 3) Email exists but password invalid -> update data from vnw -> client call login with password
         */
        var result = {
            success: false,
            msg: "Your username/password or security settings may be incorrect",
            data: null
        };
        var user = Meteor.users.findOne({"emails.address": email});
        var sql, query, vnwData;
        if (!user) {
            // pull vnw user -> if exists -> create account in Success
            sql = sprintf(VNW_QUERIES.checkLogin, email, hashVNWPassword(password), 1);
            query = mysqlManager.fetchVNWData(sql);
            if (query.length == 1) {
                vnwData = query[0];
                var _id = Accounts.createUser({
                    username: generateUsername(email.split('@')[0]),
                    email: email,
                    password: password,
                    profile: {
                        firstname: vnwData.firstname,
                        lastname: vnwData.lastname
                    }
                });
                if (_id) {
                    Meteor.users.update({_id: _id}, {
                        $set: {
                            vnwId: vnwData.userid,
                            companyId: vnwData.companyid,
                            vnwData: EJSON.parse(EJSON.stringify(vnwData)),
                            roles: [UserApi.ROLES.COMPANY_ADMIN]
                        }
                    })
                }
                Meteor.defer(function () {
                    SYNC_VNW.syncUser(vnwData);

                    var user = Meteor.users.findOne({_id: _id});

                    var hiringTeamItem = new HiringTeam();
                    if (!Meteor['hiringTeam'].findOne({email: email})) {

                        hiringTeamItem.companyId = user.companyId;
                        hiringTeamItem.email = email;
                        hiringTeamItem.username = user.username;
                        hiringTeamItem.roleId = 'admin';
                        hiringTeamItem.status = 1;
                        hiringTeamItem.name = [user.profile.firstname, user.profile.lastname].join(' ').trim();

                        if (!hiringTeamItem.name.length)
                            hiringTeamItem.name = 'admin';

                        //hiringTeamItem.roleId = [];
                        hiringTeamItem.save();
                    }

                });
                var tokenData = {
                    userId: vnwData.userid,
                    companyId: vnwData.companyid,
                    expireTime: moment(new Date()).add(5, 'day').valueOf()
                };
                return result;
            }
        } else {
            // pull vnw user -> if exists -> update password
            // pull vnw user -> if exists -> create account in Success
            sql = sprintf(VNW_QUERIES.checkLogin, email, hashVNWPassword(password), 1);
            query = mysqlManager.fetchVNWData(sql);
            if (query.length == 1) {
                vnwData = query[0];
                Accounts.setPassword(user._id, password);
                var data = {
                    vnwData: EJSON.parse(EJSON.stringify(vnwData))
                };
                var modifier = setModifier(data);

                return updateUser({_id: user._id}, modifier);
            }
            return true;
        }


    },

    getUser: function (userId, filters) {
        return Collection.find({userId: userId}, filters).fetch();
    }
};

Meteor.methods(methods);
