/**
 * Created by HungNguyen on 10/5/15.
 */

function generateUserId(userId) {
    var regEx = new RegExp('^' + userId, 'i');
    var similarLength = Meteor['hiringTeam'].find({username: regEx}).count();
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

var methods = {
    'sendRequest': function (obj) {
        try {
            console.log(obj);
            if (!obj['request-email'] || !obj.companyId || !obj.fromEmailAddress)
                return false;

            var result = null;


            var email = obj['request-email'];
            var isEmail = email.match(SimpleSchema.RegEx.Email);
            if (!isEmail)
                return result;

            var name = email.split('@')[0];
            var autoUserId = generateUserId(name);
            var autoName = generateName(name);

            var hiringTeamItem = new HiringTeam();
            hiringTeamItem.companyId = obj.companyId;
            hiringTeamItem.email = email;
            hiringTeamItem.userId = autoUserId;
            hiringTeamItem.name = autoName;

            //hiringTeamItem.roleId = [];
            result = hiringTeamItem.save();
            console.log('hiringTeamItem', hiringTeamItem);

            if (result) {
                //send email
                Meteor.defer(function () {
                    //TOO : send email
                    var emailContent = '<div>'
                        + 'active email:<a href="http://localhost:3000/active-account/'
                        + hiringTeamItem._id
                        + '">aaaa</a></div>';

                    var mail = {
                        from: obj.fromEmailAddress,
                        to: email,
                        subject: 'test activeLink',
                        html: emailContent
                    };
                    console.log('mail', mail);
                    Email.send(mail);
                });

                //save to hiringTeam

                return result;
            }


        } catch (e) {
            console.trace(e);
            return false;
        }

    },
    getRequestInfo: function (id) {
        if (!id) return false;
        try {
            console.log(id);
            return Meteor['hiringTeam'].findOne({_id: id, status: 0});
        } catch (e) {
            console.trace(e);
            return false;
        }
    },

    activeAccount(data) {
        check(data, {
            email: String,
            key: String,
            fullname: String,
            username: String,
            password: String
        });

        var tempName = data.fullname.split(' ');
        var firstName = tempName.shift();
        var lastName = tempName.join(' ');
        var user = {};
        user.username = data.username;
        user.email = data.email;
        user.password = data.password;

        user.profile = {
            firstname: firstName,
            lastname: lastName
        };

        return Accounts.createUser(user);
    }

};

methods.removeHiringTeamRequest = function(requestId) {
    if(!this.userId) return false;
    this.unblock();
    var user = Collections.Users.findOne({userId: +this.userId});
    var request = Meteor['hiringTeam'].findOne({_id: requestId});
    if(!user || !request || request.companyId != user.companyId) return false;
    return request.remove();
};

Meteor.methods(methods);