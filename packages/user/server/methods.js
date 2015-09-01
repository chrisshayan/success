/**
 * Created by HungNguyen on 8/21/15.
 */

VNW_TABLES = Meteor.settings.tables;
VNW_QUERIES = Meteor.settings.queries;

function hashVNWPassword(password) {
    var crypto = Npm.require('crypto');
    var hash = crypto.createHash(Meteor.settings.private.passwordHash);
    hash.update(password);
    return hash.digest('hex');
}

UserApi.methods = {
    isExist: function (userId) {
        if (!userId) return false;
        return (Collection.findOne({userId: userId}));
    },
    getUser: function (userId) {
        if (!userId) return false;

        return Collections.Users.findOne({userId: +userId});
    },
    updateUser: function (query, data) {
        return !!(Collection.update(query, data));
    },
    findOne: function (query, options) {
        return Collection.findOne(query, options || {});
    },
    find: function (query, options) {
        return Collection.find(query, options || {}).fetch();
    },

    loginWithVNW: function (email, password) {
        check(email, String);
        check(password, String);
        /**
         * 1) user existing in Recruit -> return true -> client will call login with password
         * 2) user does not exists in Recruit -> get account from vnw -> client call login with password
         * 3) Email exists but password invalid -> update data from vnw -> client call login with password
         */
        var user = Meteor.users.findOne({"emails.address": email});
        if (!user) {
            // pull vnw user -> if exists -> create account in Recruit
            var sql = sprintf(VNW_QUERIES.checkLogin, email, hashVNWPassword(password), 1);
            var query = fetchVNWData(sql);
            if(query.length == 1) {
                var vnwData = query[0];
                var _id = Accounts.createUser({
                    email: email,
                    password: password,
                    profile: {
                        firstname: vnwData.firstname,
                        lastname: vnwData.lastname
                    }
                });
                if(_id) {
                    Meteor.users.update({_id: _id}, {
                        $set: {
                            userId: vnwData.userid,
                            vnwData: EJSON.parse(EJSON.stringify(vnwData)),
                            roles: [UserApi.ROLES.COMPANY_ADMIN]
                        }
                    })
                }
            }
        } else if (user) {
            // pull vnw user -> if exists -> update password
            // pull vnw user -> if exists -> create account in Recruit
            var sql = sprintf(VNW_QUERIES.checkLogin, email, hashVNWPassword(password), 1);
            var query = fetchVNWData(sql);
            if(query.length == 1) {
                var vnwData = query[0];
                Accounts.setPassword(user._id, password);
                Meteor.users.update({_id: user._id}, {
                    $set: {
                        vnwData: EJSON.parse(EJSON.stringify(vnwData))
                    }
                });
            }
        }
        return true;
    }
};


Meteor.methods(UserApi.methods);