function replacePlaceholder(userId, application, candidate, mail) {
    var valid = ["candidate_first_name", "position", "company", "mail_signature"];

    var replaces = {};
    var placeholders = mail.html.match(/\[\[(\w+)\]\]/gi);
    _.each(placeholders, function (p) {
        p1 = p.replace(/\[\[|\]\]/g, "");
        if (_.indexOf(valid, p1) >= 0) {
            if (replaces.hasOwnProperty(p)) return;
            switch (p1) {
                case "candidate_first_name":
                    replaces[p1] = candidate.data.firstname || candidate.data.firstName;
                    break;

                case "position":
                    var job = Collections.Jobs.findOne({jobId: application.jobId});
                    replaces[p1] = job.title;
                    break;

                case "company":
                case "mail_signature":
                    var user = Meteor.users.findOne({_id: userId});
                    var company = Collections.CompanySettings.findOne({companyId: application.companyId});
                    if (p1 == "company") {
                        replaces[p1] = company.companyName;
                    } else {
                        replaces[p1] = user.emailSignature || '';
                    }

                    break;
            }
        }
    });

    _.templateSettings = {
        interpolate: /\[\[(.+?)\]\]/g
    };
    var template = _.template(mail.html);
    mail.html = template(replaces);

    return mail;
}

function getUserInfo(userId) {
    return Meteor.users.findOne({_id: userId}, {
        fields: {
            vnwId: 1,
            companyId: 1,
            username: 1
        }
    });
}

function transformEntryId(id) {
    if (_.isNaN(+id))
        return id;
    return +id;
}

var DEFAULT_OPTIONS_VALUES = {limit: 10},
    DEFAULT_COUNTER_FIELDS = {fields: {_id: 1}},
    DEFAULT_JOB_OPTIONS = {
        fields: {
            jobId: 1,
            userId: 1,
            companyId: 1,
            "data.jobtitle": 1,
            "data.iscompleted": 1,
            "data.noofviewed": 1,
            "data.createddate": 1,
            "data.expireddate": 1
        }
    },
    DEFAULT_APPLICATION_OPTIONS = {
        entryId: 1,
        candidateId: 1,
        companyId: 1,
        jobId: 1,
        source: 1,
        stage: 1,
        matchingScore: 1,
        disqualified: 1,
        "data.createddate": 1,
        "data.appSubject": 1,
        "data.coverletter": 1
    },
    DEFAULT_CANDIDATE_OPTIONS = {
        _id: 1,
        userId: 1,
        "data.city": 1,
        "data.username": 1,
        "data.firstname": 1,
        "data.lastname": 1,
        "data.genderid": 1,
        "data.birthday": 1,
        "data.address": 1,
        "data.district": 1,
        "data.email1": 1,
        "data.homephone": 1,
        "data.cellphone": 1,
        "data.createddate": 1
    };

/**
 * Success methods
 */
Meteor.methods({


    /**
     * Get application details
     * @param opt {Object}
     */
    getApplicationDetails: function (applicationId) {
        try {
            console.log(this.userId);
            console.log(Meteor.userId());

            if (!this.userId) return false;
            // validate client request
            check(applicationId, String);

            var conditions = {
                _id: applicationId
            };
            var options = {
                fields: {
                    entryId: 1,
                    candidateId: 1,
                    jobId: 1,
                    source: 1,
                    stage: 1,
                    matchingScore: 1,
                    disqualified: 1,
                    "data.createddate": 1,
                    "data.appSubject": 1,
                    "data.coverletter": 1
                }
            };
            var canOptions = {
                fields: {
                    _id: 1,
                    candidateId: 1,
                    "data.city": 1,
                    "data.username": 1,
                    "data.firstname": 1,
                    "data.lastname": 1,
                    "data.genderid": 1,
                    "data.birthday": 1,
                    "data.address": 1,
                    "data.district": 1,
                    "data.email1": 1,
                    "data.homephone": 1,
                    "data.cellphone": 1,
                    "data.createddate": 1
                }
            };
            var application = Collections.Applications.findOne(conditions, options);
            var candidate = Collections.Candidates.findOne({candidateId: application.candidateId}, canOptions);
        } catch (e) {
            debuger(e);
        }
        return {
            application: application,
            candidate: candidate
        };
    },

    /**
     * Get first application of job stage
     * @param opt {Object}
     * opt.jobId {Number}
     * opt.stage {Number}
     * @returns { Number|null}
     */
    getFirstJobApplication: function (opt) {
        try {
            if (!this.userId) return false;

            check(opt, {
                jobId: String,
                stage: Number
            });
            var job = Collections.Jobs.findOne({_id: opt.jobId});
            if (!job) return false;

            var application = Collections.Applications.findOne({
                jobId: job.jobId,
                stage: opt.stage
            }, {sort: {createdAt: -1}});

            return application ? application._id : false;
        } catch (e) {
            debuger(e);
        }
        return null;
    },

    /**
     * check application exists in job stage
     * @param opt {Object}
     * @param opt.jobId {String}
     * @param opt.stage {Number}
     * @param opt.application {String}
     * @returns {boolean}
     */
    checkApplicationInStage: function (opt) {
        if (!this.userId) return false;
        check(opt, {
            jobId: String,
            stage: Number,
            application: String
        });
        var job = Collections.Jobs.findOne({_id: opt.jobId});
        if (!job) return false;
        var criteria = {
            _id: opt.application,
            jobId: job.jobId,
            stage: opt.stage
        };
        return !!Collections.Applications.find(criteria).count();
    },

    //
    ///**
    // * Update application qualify
    // * @param applicationId {Number}
    // */
    //disqualifyApplication: function (applicationId) {
    //    try {
    //        if (!this.userId) return false;
    //        this.unblock();
    //
    //        check(applicationId, String);
    //        var conditions = {
    //            _id: applicationId
    //        };
    //        var application = Collections.Applications.findOne(conditions);
    //
    //        if (!application || application.disqualified == true) return;
    //
    //        var modifier = {
    //            $set: {
    //                disqualified: true
    //            }
    //        }
    //        var result = Collections.Applications.update(conditions, modifier);
    //        if (result) {
    //            // Log activity
    //            var activity = new Activity();
    //            activity.companyId = application.companyId;
    //            activity.createdBy = this.userId;
    //            activity.data = {
    //                applicationId: applicationId
    //            };
    //            activity.disqualifiedApplication();
    //        }
    //    } catch (e) {
    //        debuger(e);
    //    }
    //},
    //
    //
    //disqualifyApplications: function (stage, ids) {
    //    try {
    //        if (!this.userId) return false;
    //        var self = this;
    //        this.unblock();
    //
    //        check(ids, [String]);
    //
    //        _.each(ids, function (_id) {
    //            Meteor.defer(function () {
    //                var application = Application.findOne({appId: appId});
    //                if (!application || application.disqualified == true) return;
    //
    //                var modifier = {
    //                    $push: {
    //                        disqualified: stage
    //                    }
    //                }
    //                var result = Application.update({_id: application._id}, modifier);
    //                if (result) {
    //                    // Log activity
    //                    var activity = new Activity();
    //                    activity.companyId = application.companyId;
    //                    activity.createdBy = self.userId;
    //                    activity.data = {
    //                        applicationId: application._id
    //                    };
    //                    activity.disqualifiedApplication();
    //                }
    //            });
    //        });
    //
    //    } catch (e) {
    //        debuger(e);
    //    }
    //},
    //
    //
    //
    //revertQualifyApplications: function (stage, ids) {
    //    try {
    //        if (!this.userId) return false;
    //        var self = this;
    //        this.unblock();
    //
    //        check(ids, [String]);
    //
    //        _.each(ids, function (_id) {
    //            Meteor.defer(function () {
    //                var application = Collections.Applications.findOne({_id: _id});
    //                if (!application) return;
    //                var conditions = {
    //                    _id: _id
    //                };
    //                var modifier = {
    //                    $pull: {
    //                        disqualified: stage
    //                    }
    //                }
    //                var result = Collections.Applications.update(conditions, modifier);
    //                if (result) {
    //                    // Log activity
    //                    var activity = new Activity();
    //                    activity.companyId = application.companyId;
    //                    activity.createdBy = self.userId;
    //                    activity.data = {
    //                        applicationId: _id
    //                    };
    //                    activity.revertApplication();
    //                }
    //            });
    //        });
    //
    //    } catch (e) {
    //        debuger(e);
    //    }
    //},
    ///**
    // * Update application qualify
    // * @param applicationId {Number}
    // */
    //revertApplication: function (applicationId) {
    //    try {
    //        if (!this.userId) return false;
    //        check(applicationId, String);
    //        var application = Collections.Applications.findOne({_id: applicationId});
    //        if (!application) return;
    //        var conditions = {
    //            _id: applicationId
    //        };
    //        var modifier = {
    //            $set: {
    //                disqualified: false
    //            }
    //        }
    //        var result = Collections.Applications.update(conditions, modifier);
    //        if (result) {
    //            // Log activity
    //            var activity = new Activity();
    //            activity.companyId = application.companyId;
    //            activity.createdBy = this.userId;
    //            activity.data = {
    //                applicationId: applicationId
    //            };
    //            activity.revertApplication();
    //        }
    //    } catch (e) {
    //        debuger(e);
    //    }
    //    return result;
    //},

    /**
     * Update company mail signature
     * @param signature {String} weak - html content
     */
    updateMailSignature: function (signature) {
        try {
            if (!this.userId) return false;

            check(signature, String);
            var user = Meteor.users.findOne({_id: this.userId});
            var cond = {
                companyId: user.data.companyid
            };
            var modifier = {
                $set: {
                    mailSignature: signature
                }
            };

            return Collections.CompanySettings.update(cond, modifier);
        } catch (e) {
            debuger(e);
            return false;
        }
    },

    /**
     * Send email to candidate
     * @param data {Object}
     * @param data.application {Number}
     * @param data.subject {String}
     * @param data.content {String}
     */
    sendMailToCandidate: function (data) {
        try {
            if (!this.userId) return false;

            check(data, {
                application: Match.Any,
                mailTemplate: String,
                subject: String,
                content: String,
                emailFrom: Match.Any
            });

            var self = this;

            var mailTemplate = Collections.MailTemplates.findOne(data.mailTemplate);

            var from = '';
            if (data.emailFrom) {
                from = data.emailFrom
            }
            else if (!mailTemplate) {
                from = user.username;
            }
            else {
                from = mailTemplate.emailFrom;
            }
            console.log('email from : ', from);

            var application = Collections.Applications.findOne({_id: data.application});
            if (!application) return false;
            var candidate = Collections.Candidates.findOne({candidateId: application.candidateId});
            if (!candidate) return false;
            var to = candidate.data.email1 || candidate.data.email2 || candidate.data.username || candidate.data.email || "";
            if (!to) return false;

            var mail = {
                from: from,
                to: to,
                subject: data.subject,
                html: data.content,
                replyTo: 'success-inbound@izzilab.com'
            };

            Meteor.defer(function () {
                mail = replacePlaceholder(self.userId, application, candidate, mail);
                Email.send(mail);
                var activity = new Activity();

                mail.applicationId = data.application;
                activity.companyId = application.companyId;
                activity.createdBy = self.userId;
                activity.data = mail;
                activity.sendMailToCandidate();
            });
        } catch (e) {
            debuger(e);
        }
        return true;
    },

    sendMailToCandidates: function (data) {
        try {
            if (!this.userId) return false;
            check(data, {
                to: [String],
                mailTemplate: String,
                subject: String,
                content: String,
                emailFrom: Match.Optional(String)
            });

            this.unblock();
            var self = this;
            var user = Meteor.users.findOne({_id: this.userId});
            var company = user.defaultCompany();

            _.each(data.to, function (appId) {
                var mailTemplate = Collections.MailTemplates.findOne(data.mailTemplate);

                var from = user.defaultEmail();

                var application = Collections.Applications.findOne({_id: appId});
                if (!application) return false;
                var candidate = Collections.Candidates.findOne({candidateId: application.candidateId});
                if (!candidate) return false;
                var to = candidate.data.username || candidate.data.email1 || candidate.data.email2 || candidate.data.email || "";
                if (!to) return false;

                var mail = {
                    from: from,
                    to: to,
                    subject: data.subject,
                    html: data.content
                };

                Meteor.defer(function () {
                    mail = replacePlaceholder(self.userId, application, candidate, mail);

                    Email.send(mail);
                    var activity = new Activity();

                    mail.applicationId = application._id;
                    activity.companyId = company.companyId;
                    activity.createdBy = user._id;
                    activity.data = mail;
                    activity.sendMailToCandidate();
                });
            });

        } catch (e) {
            debuger(e);
        }
        return true;
    },

    /**
     * Add comment to application
     * @param data {Object}
     * @param data.application {Number}
     * @param data.content {String}
     */
    addCommentApplication: function (data) {
        try {
            check(data, {
                application: String,
                content: String
            });

            this.unblock();
            var application = Collections.Applications.findOne({_id: data.application});
            if (!application) return false;
            var activity = new Activity();
            activity.companyId = application.companyId;
            activity.createdBy = this.userId;
            activity.data = {
                applicationId: data.application,
                content: data.content
            };
            activity.addCommentApplication();
        } catch (e) {
            debuger(e);
            return false;
        }
        return true;
    },

    /**
     * REFACTOR NEW METHODS
     */

    jobCounter: function (filters) {
        this.unblock();
        check(filters, Object);
        var user = getUserInfo(+this.userId);
        var DEFAULT_FILTERS = {
            companyId: user.companyId
        };
        filters = _.defaults(DEFAULT_FILTERS, filters);
        return Collections.Jobs.find(filters).count();
    },

    getJobs: function (filters, options) {
        check(filters, Object);
        check(options, Match.Optional(Object));
        var user = getUserInfo(+this.userId);
        var DEFAULT_FILTERS = {
            companyId: user.companyId
        };

        filters = _.defaults(DEFAULT_FILTERS, filters);
        options = _.extend(DEFAULT_OPTIONS_VALUES, options);
        options = _.defaults(DEFAULT_JOB_OPTIONS, options);
        return Collections.Jobs.find(filters, options).fetch();
    },

    getCompanyInfo: function (companyId) {
        return Collections.CompanySettings.findOne({companyId: companyId});
    },

    setNumberOfMonth: function (newValue, companyId) {
        var query = {companyId: companyId}
            , options = {
                fields: {numberOfMonthSync: 1}
            };

        var oldValue = Collections.CompanySettings.findOne(query, options);
        try {
            Collections.CompanySettings.update(query, {$set: {numberOfMonthSync: newValue}});
            if (!oldValue.numberOfMonthSync || oldValue.numberOfMonthSync < newValue) {
                //TODO : re-sync data

            }

            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    },


    addCandidate: function (data, jobId) {
        try {
            if (!this.userId) return false;
            check(data, Object);
            check(jobId, Match.Any);

            var isCandidateExists = false;
            var user = Meteor.users.findOne({_id: this.userId});
            var company = user.defaultCompany();
            var job = Collections.Jobs.findOne({_id: jobId});
            if (!job) return false;

            email = data.email.trim();

            var criteria = {
                jobId: job.jobId,
                "candidateInfo.emails": data.email
            };
            var options = {
                limit: 1
            };
            var isAppExists = Collections.Applications.find(criteria, options).count() > 0;
            if (isAppExists) return false;

            if (!isCandidateExists) {
                can = new Schemas.Candidate();
                can.candidateId = null;
                can.data = data;
                can.createdAt = new Date();
                var candidateId = Collections.Candidates.insert(can);
                Collections.Candidates.update({_id: candidateId}, {$set: {candidateId: candidateId}});
            }

            var application = new Schemas.Application();
            application.source = 3;
            application.stage = 0;
            application.companyId = job.companyId;
            application.jobId = job.jobId;
            application.candidateId = candidateId;
            application.data = {};
            var candidateInfo = {
                firstName: can.data.firstname || can.data.firstName || '',
                lastName: can.data.lastname || can.data.lastName || '',
                emails: [can.data.username, can.data.email, can.data.email1, can.data.email2],
                city: can.data.city || ''
            };
            candidateInfo['fullname'] = [candidateInfo.lastName, candidateInfo.firstName].join(' ');
            candidateInfo.emails = _.filter(candidateInfo.emails, (email) => email != void 0);
            application.candidateInfo = candidateInfo;

            var appId = Collections.Applications.insert(application);
            Collections.Applications.update({_id: appId}, {$set: {entryId: appId}});
            // Log applied activity
            var activity = new Activity();
            activity.companyId = job.companyId;
            activity.data = {
                applicationId: appId,
                source: 3,
                userId: candidateId
            };
            activity.createdAt = application.createdAt;
            activity.createdBy = this.userId;
            activity.addCandidateToSourced();

            if (data.email) {
                Meteor.defer(function () {
                    try {
                        var apiUrl = process.env.VNW_API_URI + Meteor.settings.VNW_API.registerAccount;
                        var apiKey = process.env.VNW_API_KEY;
                        var result = Meteor.http.call(
                            "POST",
                            apiUrl, {
                                headers: {
                                    "content-type": "application/json",
                                    "Accept": "application/json",
                                    "content-md5": apiKey
                                },
                                data: {
                                    "email": data.email,
                                    "firstname": data.firstName,
                                    "lastname": data.lastName
                                }
                            }
                        );

                        var content = JSON.parse(result.content);
                        console.log("Add account vnw: ", content);
                    } catch (e) {
                        console.log("rest-api-failed", "Failed to call the REST api on VietnamWorks", e);
                    }
                })
            }

        } catch (e) {
            debuger(e);
            return false;
        }
        return {candidateId: candidateId};
    },

    checkCandidateExists: function (data) {
        check(data, {
            jobId: Match.Any,
            email: String
        });
        var job = Collections.Jobs.findOne({_id: data.jobId});
        if (!job) return false;
        email = data.email.trim();

        var criteria = {
            jobId: job.jobId,
            "candidateInfo.emails": data.email
        };
        var options = {
            limit: 1
        };
        return Collections.Applications.find(criteria, options).count() > 0;
    }

});

Meteor.methods({
    'getEmailList': function () {
        var listEmail = [];

        /*        var user = Collections.Users.findOne({userId: +this.userId});
         if (!user) return [];*/

        var user = Meteor.users.findOne({_id: this.userId});
        if (!user) return [];

        var query = {
            companyId: user.companyId
        };
        var options = {
            fields: {
                'recruiterEmails': 1
            }
        };


        Collections.Jobs.find(query, options).map(function (obj) {
            if (obj.recruiterEmails)
                listEmail = listEmail.concat(obj.recruiterEmails);
        });

        return _.unique(listEmail);
    },
    'getResumeOnlineInfo': function (resumeId) {
        return Collections.Resumes.findOne({resumeId: resumeId});
    }
});

Meteor.methods({
    addJob: function (data) {
        console.log('add job', data, this.userId);

        if (!this.userId) return false;

        var currentUser = Meteor.users.findOne({_id: this.userId});

        if (!currentUser.companyId) {
            var listCompanyByUser = Meteor.call('getCompanyListByUser');

            if (listCompanyByUser.length) {
                data.companyId = listCompanyByUser[0].companyId
            }
        }

        if (currentUser) {
            data.companyId = data.companyId || currentUser.companyId || -1;
            data.data = {};
            data.source = "recruit";
            data.status = 1;
            data.createdAt = new Date();
            data.createdBy = this.userId;
            data.userId = this.userId;

            var jobId = Collections.Jobs.insert(data);
            if (jobId) {
                Collections.Jobs.update({_id: jobId}, {
                    $set: {
                        jobId: jobId
                    }
                });

                return jobId;
            }
        }
        return false;
    },

    updateJobs: function (modifier, _id) {
        //console.log('modified : ', modifier);
        console.log('id : ', _id);
        return Collections.Jobs.update({_id: _id}, modifier);

    },

    searchSkill: function (keyword) {
        check(keyword, String);
        var result = [];
        var searchCond = {
            $regex: keyword,
            $options: 'i'
        };
        var fields = {
            _id: 1,
            skillName: 1
        };
        var mapResult = function (doc) {
            doc.char = doc.skillName.length;
            return doc;
        }
        var search1 = Collections.SkillTerms.find({
            skillName: searchCond,
            $where: 'this.skillName.length > 0 && this.skillName.split().length < 5'
        }, {fields: fields, limit: 20});
        result = result.concat(search1.map(mapResult));

        if (search1.count() < 20) {
            var search2 = Collections.SkillTerms.find({
                skillName: searchCond,
                $where: 'this.skillName.length > 0 && this.skillName.split().length < 10'
            }, {fields: fields, limit: 20 - search1.count()});
            result = result.concat(search2.map(mapResult))
        }
        return result;
    },

    assignJobRecruiter: function (jobId, role, userId) {
        if (this.userId) {
            var Collection = JobExtra.getCollection();
            var jobExtra = Collection.findOne({jobId: jobId});
            var user = Meteor.users.findOne({_id: userId});

            if (jobExtra && user) {
                var recruiter = {
                    userId: user._id,
                    email: user.defaultEmail(),
                    name: user.fullname() || user.username || user.defaultEmail() || ''
                };
                jobExtra.push(`recruiters.${role}`, recruiter);
                return jobExtra.save();
            }
        }
        return false;
    },

    unassignJobRecruiter: function (jobId, role, userId) {
        if (this.userId) {
            var Collection = JobExtra.getCollection();
            var jobExtra = Collection.findOne({jobId: jobId});
            var user = Meteor.users.findOne({_id: userId});

            if (jobExtra && user) {
                var selector = `recruiters.${role}`;
                var pullMod = {};
                pullMod[selector] = {userId};
                return Collection.update({_id: jobExtra._id}, {$pull: pullMod});
            }
        }
        return false;
    },

    getCompanyByIds: function (idList) {
        if (typeof idList !== 'object' || !idList.length)
            return null;

        var companies = Collections.CompanySettings.find({
            companyId: {'$in': idList}
        }).fetch();

        console.log(companies);

        return companies;
    },


    getCVToken() {
        if (!this.userId) return false;
        var user = Meteor.users.findOne({_id: this.userId});
        var company = user.defaultCompany();
        var tokenData = {
            userId: user._id,
            companyId: company.companyId,
            expireTime: moment(new Date()).add(1, 'day').valueOf()
        };
        return IZToken.encode(tokenData);
    },

    scheduleInterview(jobId, appId, event) {
        var self = this;
        this.unblock();
        var user = Meteor.users.findOne({_id: this.userId});
        var job = Collections.Jobs.findOne({_id: jobId});
        var application = Collections.Applications.findOne({_id: appId});
        if(!job || !application) return false;
        var candidate = Collections.Candidates.findOne({candidateId: application.candidateId});
        var attendeeEmails = [application.candidateInfo.emails[0]];
        var attendees = [];
        attendees.push({
            cn: application.candidateInfo.fullname,
            mailTo: application.candidateInfo.emails[0],
            partStat: "NEEDS-ACTION"
        });

        _.each(event.interviewers, function(id) {
            var u = Meteor.users.findOne({_id: id});
            if(u) {
                var uName = u.username || u.defaultEmail();
                if(u['profile']) {
                    uName = [u['profile']['firstname'] || '', u['profile']['lastname'] || '' ].join(' ');
                }
                attendees.push({
                    cn: uName,
                    mailTo: u.defaultEmail(),
                    partStat: "NEEDS-ACTION"
                });
                attendeeEmails.push(u.defaultEmail())
            }
        });
        var mail = {
            from: user.defaultEmail(),
            to: attendeeEmails,
            subject: event.subject,
            html: event.html,
            headers: {
                "Content-class": "urn:content-classes:calendarmessage"
            }
        };
        mail = replacePlaceholder(self.userId, application, candidate, mail);
        var activity = new Activity();
        activity.data = {
            jobId: jobId,
            applicationId: appId,
            interviewers: event.interviewers,
            scheduleDate: event.scheduleDate,
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,
            subject: event.subject,
            html: mail.html
        };
        activity.companyId = job.companyId;
        activity.createdAt = new Date();
        activity.createdBy = this.userId;
        var activityId = activity.scheduleInterview();

        Meteor.defer(function() {
            var organizerName = user.username || user.defaultEmail();
            if(user['profile']) {
                organizerName = [user['profile']['firstname'] || '', user['profile']['lastname'] || '' ].join(' ');
            }
            var calOptions = {
                prodId: "//Vietnamworks//Success",
                method: "REQUEST",
                events: [
                    {
                        uid: activityId,
                        summary: event.subject,
                        dtStart: event.startTime,
                        dtEnd: event.endTime,
                        organizer: {cn: organizerName , mailTo: user.defaultEmail()},
                        attendees: attendees
                    }
                ]
            };
            var cal = new IcsGenerator(calOptions);

            mail['attachments'] = [
                {
                    fileName: 'invite.ics',
                    contents: cal.toIcsString(),
                    contentType: 'text/calendar'
                }
            ];
            Email.send(mail);
        });

        return !!activityId;
    }
});


Meteor.methods({
    getSendMessageData(appIds = []) {
        if(!this.userId) return false;
        check(appIds, [Number]);
        const currentUser = Meteor.users.findOne({_id: this.userId});
        if(!currentUser) return false;
        const templates = Collections.MailTemplates.find({companyId: currentUser.companyId});
        const result = {
            emails: [],
            templates: templates.fetch()
        };

        if(!_.isEmpty(appIds)) {
            const apps = Application.find({appId: {$in: appIds}});
            _.each(apps.fetch(), (app) => {
                result.emails.push(app.emails[0]);
            })
        }

        return result;
    },

    getResumeDetails: function(appId) {
        if(!this.userId) return null;
        this.unblock();
        try {
            const req = HTTP.get(Meteor.absoluteUrl() + 'api/resume');
            if(req.statusCode === 200) {
                return EJSON.parse(req.content);
            }
        } catch (e) {
            console.trace(e);
        }
        return null;
    }
});