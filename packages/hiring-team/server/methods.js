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
            if (!this.userId) return false;
            try {
                //console.log(obj);
                var user = Meteor.users.findOne({_id: this.userId});
                if (!obj['request-email'])
                    return {
                        status: 0,
                        message: 'Missing content.'
                    };


                var email = obj['request-email'];
                var isEmail = email.match(SimpleSchema.RegEx.Email);
                if (!isEmail)
                    return {
                        status: 0,
                        message: 'This email is invalid.'
                    };


                var name = email.split('@')[0];
                var autoUserId = generateUserId(name);
                var autoName = generateName(name);

                var hiringTeamItem = new HiringTeam();
                if (Meteor['hiringTeam'].findOne({companyId: user.companyId, email: email}))
                    return {
                        status: 0,
                        message: 'This email address is exist in your hiring team already'
                    };

                hiringTeamItem.companyId = user.companyId;
                hiringTeamItem.email = email;
                hiringTeamItem.userId = autoUserId;
                hiringTeamItem.name = autoName;

                var company = Collections.CompanySettings.findOne({companyId: user.companyId});

                //hiringTeamItem.roleId = [];
                var result = hiringTeamItem.save();
                console.log('hiringTeamItem', hiringTeamItem);

                if (result) {
                    //send email
                    Meteor.defer(function () {
                            //TOO : send email
                            SSR.compileTemplate('HiringTeamInvitation', Assets.getText('private/hiring-team-invitation.html'));
                            var link = Meteor.absoluteUrl('active-account/' + hiringTeamItem._id);
                            var subject = 'Sign up to join hiring team';
                            var html = SSR.render("HiringTeamInvitation", {
                                subject: subject,
                                companyName: company.companyName,
                                link: link
                            });

                            var mail = {
                                from: user.defaultEmail(),
                                to: email,
                                subject: subject,
                                html: html
                            };
                            console.log('mail', mail);
                            Email.send(mail);
                        }
                    );

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
        }
        ,

        activeAccount(data)
        {
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

            var result = Accounts.createUser(user);

            if (result) {
                Meteor['hiringTeam'].update({_id: data.key}, {
                    '$set': {
                        status: 1,
                        userId: user.username
                    }
                });
                console.log(result);
                return result;
            }


        }
        ,
        validateUserLoginInfo: function (input) {
            if (typeof input !== 'string') return false;
            return !!(Meteor.users.findOne({'$or': [{username: input}, {'emails.address': input}]}));
        }

    }
    ;

methods.removeHiringTeamRequest = function (requestId) {
    if (!this.userId) return false;
    this.unblock();
    var user = Meteor.users.findOne({_id: this.userId});
    var request = Meteor['hiringTeam'].findOne({_id: requestId});
    if (!user || !request) return false;
    return request.remove();
};

Meteor.methods(methods);