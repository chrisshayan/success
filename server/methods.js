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
                    replaces[p1] = job.data.jobtitle;
                    break;

                case "company":
                case "mail_signature":
                    var user = Collections.Users.findOne({userId: parseInt(userId)});
                    var company = Collections.CompanySettings.findOne({companyId: user.data.companyid});
                    if (p1 == "company") {
                        replaces[p1] = company.companyName;
                    } else {
                        replaces[p1] = company.mailSignature;
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
    return Collections.Users.findOne({userId: userId}, {
        fields: {
            userId: 1,
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
 * Recruit methods
 */
Meteor.methods({
    /**
     * Update application state
     * @param entryId {Number}
     * @param toStage {Number} in range 1,2,3,4,5
     * @returns {Boolean} the update result
     */
    updateApplicationStage: function (option) {
        try {
            if (!this.userId) return false;

            check(option, {
                application: Match.Any,
                stage: Number
            });
            option.application = transformEntryId(option.application);

            check(option.stage, Match.OneOf(0, 1, 2, 3, 4, 5));
            var user = getUserInfo(+this.userId);
            var cond = {
                companyId: user.companyId,
                entryId: option.application
            };

            var application = Collections.Applications.findOne(cond);
            if (!application) return false;
            if ((application.stage == 0 && option.stage == 1) || (application.stage == 1 && option.stage == 0)) return false;

            var data = {
                $set: {
                    stage: option.stage
                }
            }
            var result = Collections.Applications.update(application._id, data);
            if (result) {
                // log to activities
                var activity = new Activity();
                activity.data = {
                    jobId: application.jobId,
                    applicationId: option.application,
                    candidateId: application.userId,
                    fromStage: application.stage,
                    toStage: option.stage
                };
                activity.companyId = user.companyId;
                activity.createdBy = this.userId;
                activity.updateApplicationStage();
            }
        } catch (e) {
            debuger(e);
        }
        return result;
    },

    /**
     * Get application details
     * @param opt {Object}
     */
    getApplicationDetails: function (applicationId) {
        try {
            if (!this.userId) return false;
            // validate client request
            check(applicationId, Match.Any);
            applicationId = transformEntryId(applicationId);

            var conditions = {
                entryId: applicationId
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
                jobId: Number,
                stage: Number
            });

            var application = Collections.Applications.findOne({
                jobId: opt.jobId,
                stage: opt.stage
            }, {sort: {matchingScore: -1}});

            return application.entryId;
        } catch (e) {
            debuger(e);
        }
        return null;
    },

    /**
     * check application exists in job stage
     * @param opt {Object}
     * opt.jobId: Number,
     * opt.stage: Number,
     * opt.application: Number
     * @returns {boolean}
     */
    checkApplicationInStage: function (opt) {
        if (!this.userId) return false;
        check(opt, {
            jobId: Number,
            stage: Number,
            application: Match.Any
        });
        opt.application = transformEntryId(opt.application);
        var conditions = {
            jobId: opt.jobId,
            stage: opt.stage,
            entryId: opt.application
        };
        return !!Collections.Applications.find(conditions).count();
    },


    /**
     * Update application qualify
     * @param applicationId {Number}
     */
    disqualifyApplication: function (applicationId) {
        try {
            if (!this.userId) return false;
            this.unblock();

            check(applicationId, Match.Any);
            applicationId = transformEntryId(applicationId);

            var user = getUserInfo(+this.userId);
            var conditions = {
                companyId: user.companyId,
                entryId: applicationId
            };
            var application = Collections.Applications.findOne(conditions, {fields: {_id: 1, disqualified: 1}});
            if (!application || application.disqualified == true) return;

            var modifier = {
                $set: {
                    disqualified: true
                }
            }
            var result = Collections.Applications.update(application._id, modifier);
            if (result) {
                // Log activity
                var activity = new Activity();
                activity.companyId = user.companyId;
                activity.createdBy = user.userId;
                activity.data = {
                    applicationId: applicationId
                };
                activity.disqualifiedApplication();
            }
        } catch (e) {
            debuger(e);
        }
    },
    /**
     * Update application qualify
     * @param applicationId {Number}
     */
    revertApplication: function (applicationId) {
        try {
            if (!this.userId) return false;

            check(applicationId, Match.Any);
            applicationId = transformEntryId(applicationId);

            var user = getUserInfo(+this.userId);
            var conditions = {
                companyId: user.companyId,
                entryId: applicationId
            };
            var modifier = {
                $set: {
                    disqualified: false
                }
            }
            var result = Collections.Applications.update(conditions, modifier);
            if (result) {
                // Log activity
                var activity = new Activity();
                activity.companyId = user.companyId;
                activity.createdBy = user.userId;
                activity.data = {
                    applicationId: applicationId
                };
                activity.revertApplication();
            }
        } catch (e) {
            debuger(e);
        }
        return result;
    },

    /**
     * Update company mail signature
     * @param signature {String} weak - html content
     */
    updateMailSignature: function (signature) {
        try {
            if (!this.userId) return false;

            check(signature, String);
            var user = Collections.Users.findOne({userId: +this.userId});
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


            data.application = transformEntryId(data.application);
            var self = this;
            var user = getUserInfo(+this.userId);
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

            var application = Collections.Applications.findOne({entryId: data.application, companyId: user.companyId});
            if (!application) return false;
            var candidate = Collections.Candidates.findOne({candidateId: application.candidateId});
            if (!candidate) return false;
            var to = candidate.data.email1 || candidate.data.email2 || candidate.data.username || candidate.data.email || "";
            if (!to) return false;

            var mail = {
                from: from,
                to: to,
                subject: data.subject,
                html: data.content
            };

            Meteor.defer(function () {
                mail = replacePlaceholder(self.userId, application, candidate, mail);
                Meteor.Mandrill.send(mail);
                var activity = new Activity();

                mail.applicationId = data.application;
                activity.companyId = user.companyId;
                activity.createdBy = user.userId;
                activity.data = mail;
                activity.sendMailToCandidate();
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
                application: Match.Any,
                content: String
            });
            data.application = transformEntryId(data.application);

            this.unblock();
            var user = getUserInfo(+this.userId);
            var application = Collections.Applications.findOne({entryId: data.application, companyId: user.companyId});
            if (!application) return false;
            var activity = new Activity();
            activity.companyId = user.companyId;
            activity.createdBy = user.userId;
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
            check(jobId, Number);

            if (data.email) {
                var criteria = {
                    $or: [
                        {"data.username": data.email},
                        {"data.email": data.email},
                        {"data.email1": data.email},
                        {"data.email2": data.email}
                    ]
                };
                if (Collections.Candidates.find(criteria).count() > 0)
                    return false;
            }

            var user = getUserInfo(+this.userId);
            can = new Schemas.Candidate();
            can.candidateId = null;
            can.data = data;
            can.createdAt = new Date();
            var candidateId = Collections.Candidates.insert(can);
            Collections.Candidates.update({_id: candidateId}, {$set: {candidateId: candidateId}});

            var application = new Schemas.Application();
            application.source = 3;
            application.stage = 0;
            application.companyId = user.companyId;
            application.jobId = jobId;
            application.candidateId = candidateId;
            application.data = {};
            var appId = Collections.Applications.insert(application);
            Collections.Applications.update({_id: appId}, {$set: {entryId: appId}});

            // Log applied activity
            var activity = new Activity();
            activity.companyId = user.companyId;
            activity.data = {
                applicationId: appId,
                source: 3,
                userId: candidateId
            };
            activity.createdAt = application.createdAt;
            activity.addCandidateToSourced();


        } catch (e) {
            debuger(e);
            return false;
        }
        return true;
    },

    checkCandidateExists: function (email) {
        check(email, String);
        email = email.trim();

        var criteria = {
            $or: [
                {"data.username": email},
                {"data.email": email},
                {"data.email1": email},
                {"data.email2": email}
            ]
        };
        var options = {
            limit: 1
        };
        return Collections.Candidates.find(criteria, options).count() > 0;
    }

});

Meteor.methods({
    'getEmailList': function () {
        var listEmail = [];
        var user = Collections.Users.findOne({userId: +this.userId});
        var query = {
            companyId: user.companyId
        };
        var options = {
            fields: {
                'data.emailaddress': 1
            }
        };


        Collections.Jobs.find(query, options).map(function (obj) {
            if (obj.data.emailaddress)
                listEmail = listEmail.concat(obj.data.emailaddress.toLowerCase().match(/[A-Za-z\.0-9_]+@[a-zA-Z\.0-9_]+/g));
        });

        return _.unique(listEmail);
    }
});