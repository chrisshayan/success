/**
 * Created by HungNguyen on 10/5/15.
 */

function generateUsername(userId) {
    userId = userId.replace(/[-_]/g, '.');
    var regEx = new RegExp('^' + userId + '$', 'i');
    var similarLength = Meteor['hiringTeam'].find({username: regEx}).count();

    while (similarLength && Meteor.users.findOne({username: userId + similarLength})) {
        similarLength++;
    }

    var newUserId = (similarLength) ? userId + similarLength : userId;

    return newUserId.toLowerCase();
}

function generateName(name) {
    if (!name) return '';

    return name.replace(/[_\.\d]/g, ' ').trim().split(' ').map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

var methods = {
        sendRequest: function (obj) {
            if (!this.userId) return false;
            var autoUsername = '', autoName = '';

            try {
                var user = Meteor.user(); //Meteor.users.findOne({_id: this.userId});
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

                // Validate email if it was exist in vnw database
                var query = "SELECT * FROM tblregistrationinfo WHERE username=\"%s\" AND youareid = 1 LIMIT 1;";
                var appSql = sprintf(query, email);

                var rows = mysqlManager.fetchVNWData(appSql);

                var hiringTeamItem = new HiringTeam();

                if (Meteor['hiringTeam'].findOne({email: email}) || rows.length)
                    return {
                        status: 0,
                        message: 'This email address exists in hiring team.'
                    };
                var name = email.split('@')[0];
                var existRecruiter = Meteor.users.findOne({'emails.address': email});

                if (existRecruiter) {
                    hiringTeamItem.username = existRecruiter.username;
                    hiringTeamItem.name = [existRecruiter.profile.firstname, existRecruiter.profile.lastname].join(' ');

                } else {
                    autoUsername = generateUsername(name);
                    autoName = generateName(name);
                    hiringTeamItem.username = autoUsername;
                    hiringTeamItem.name = autoName;
                }

                hiringTeamItem.companyId = user.companyId;
                hiringTeamItem.email = email;

                hiringTeamItem.roleId = 'recruiter';

                var company = Collections.CompanySettings.findOne({companyId: user.companyId});

                //hiringTeamItem.roleId = [];
                var result = hiringTeamItem.save();

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
                            Email.send(mail);
                        }
                    );

                    //save to hiringTeam

                    return result;
                }


            } catch (e) {
                console.trace(e);
                console.log(autoUsername, autoName);
                return false;
            }

        },

        getCompanyListByUser: function () {
            var companyIdList = Collection.find({userId: this.userId}).map(function (comp) {
                return comp.companyId
            });

            return Meteor.call('getCompanyByIds', companyIdList);


        },

        getRequestInfo: function (id) {
            if (!id) return false;
            try {

                var hiringTeam = Meteor['hiringTeam'].findOne({_id: id, status: 0});
                if (!hiringTeam) return false;

                var isExistUser = Meteor.users.findOne({'emails.address': hiringTeam.email});

                return {
                    hiringTeamInfo: hiringTeam,
                    isExistUser: isExistUser
                };

            } catch (e) {
                console.trace(e);
                return false;
            }
        },

        activeAccount: function (data) {
            //console.log(data);
            check(data, {
                email: String,
                key: String,
                fullname: String,
                username: String,
                password: Match.Optional(String)
            });

            var tempName = data.fullname.split(' ');
            var firstName = tempName.shift();
            var lastName = tempName.join(' ');

            var hiringTeamProfile = Meteor.hiringTeam.findOne({_id: data.key});

            if (!data.password && hiringTeamProfile.username !== data.username)
                return false;

            var user = Meteor.users.findOne({'emails.address': data.email});
            var result = null;

            if (!user) {
                var validLoginInfo = Meteor.call('validateUserLoginInfo', data.username);

                if (validLoginInfo !== 0) {
                    return validLoginInfo;
                }

                user = {};
                user.username = data.username;
                user.email = data.email;
                user.password = data.password;

                user.profile = {
                    firstname: firstName,
                    lastname: lastName
                };

                result = Accounts.createUser(user);

            } else {
                result = user._id;

                user.profile = {
                    firstname: firstName,
                    lastname: lastName
                };
                user.save();
            }
            //console.log('result', result);


            if (result) {
                var hiringTeamInfo = Meteor['hiringTeam'].findOne({email: data.email});

                Meteor.users.update({
                    _id: result
                }, {
                    '$set': {
                        companyId: hiringTeamInfo.companyId,
                        isAssigned: true
                    }
                });

                hiringTeamInfo.username = user.username;
                hiringTeamInfo.status = 1;
                hiringTeamInfo.userId = result;

                hiringTeamInfo.name = data.fullname;

                hiringTeamInfo.save();

                return result;
            } else {
                console.log('error');
            }


        },

        validateUserLoginInfo: function (input) {
            var allowRegexp = new RegExp('^[a-zA-Z0-9\.]+$');
            if (typeof input !== 'string' || !allowRegexp.test(input)) return 2;
            return (Meteor.users.findOne({'$or': [{username: input}, {'emails.address': input}]})) ? 1 : 0;
        }

    }
    ;

methods.removeHiringTeamRequest = function (requestId) {
    if (!this.userId) return false;
    this.unblock();

    var roles = ['manager', 'recruiter'];
    var request = Meteor['hiringTeam'].findOne({_id: requestId});
    var Collection = JobExtra.getCollection();

    var user = Meteor.users.findOne({_id: this.userId});

    if (!user || !request || request.roleId === 'admin')
        return false;

    user.isAssigned = false;
    user.save();


    roles.forEach((role)=> {
        var selector = `recruiters.${role}`;
        var pullMod = {};
        pullMod[selector] = {email: request.email};
        return Collection.update({}, {
            $pull: pullMod
        }, {
            multi: true
        });
    });

    return request.remove();
};


/*methods.setupDefaultHiringTeam = function () {
 if (!this.userId) return false;

 var user = Meteor.users.findOne({_id: this.userId});
 if (user.emails || user.emails[0])
 return false;

 var email = user.emails[0].address;

 var hiringTeamItem = new HiringTeam();
 if (Meteor['hiringTeam'].findOne({email: email}))
 return {
 status: 0,
 message: 'This email address is exist in your hiring team already'
 };

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
 };*/


methods['hiringTeam.recruitersWithoutMySelf'] = function () {
    if (!this.userId) return [];
    const user = Meteor.users.findOne({_id: this.userId});
    if (!user || !user.companyId) return [];
    return Meteor.users.find({_id: {$ne: user._id}, companyId: user.companyId}).map(function (r) {
        return {
            name: r.fullname() || r.username,
            username: r.username
        }
    });
};
Meteor.methods(methods);