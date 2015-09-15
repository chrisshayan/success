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

var setModifier = function (obj) {
    if (typeof obj !== 'object' || obj.length != void 0) return;
    // remove unchanged field
    delete obj._id;
    delete obj.userId;

    return {'$set ': obj};
};


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
         * 1) user existing in Recruit -> return true -> client will call login with password
         * 2) user does not exists in Recruit -> get account from vnw -> client call login with password
         * 3) Email exists but password invalid -> update data from vnw -> client call login with password
         */
        var user = Meteor.users.findOne({"emails.address": email});
        var sql, query, vnwData;
        if (!user) {
            // pull vnw user -> if exists -> create account in Recruit
            sql = sprintf(VNW_QUERIES.checkLogin, email, hashVNWPassword(password), 1);
            query = fetchVNWData(sql);
            if (query.length == 1) {
                vnwData = query[0];
                var _id = Accounts.createUser({
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
                            userId: vnwData.userid,
                            vnwData: EJSON.parse(EJSON.stringify(vnwData)),
                            roles: [UserApi.ROLES.COMPANY_ADMIN]
                        }
                    })
                }
            }
            return true;

        } else {
            // pull vnw user -> if exists -> update password
            // pull vnw user -> if exists -> create account in Recruit
            sql = sprintf(VNW_QUERIES.checkLogin, email, hashVNWPassword(password), 1);
            query = fetchVNWData(sql);
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
