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
                    replaces[p1] = candidate.data.firstname;
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
        check(option, {
            application: Number,
            stage: Number
        });
        check(option.stage, Match.OneOf(1, 2, 3, 4, 5));
        var user = getUserInfo(+this.userId);
        var cond = {
            companyId: user.companyId,
            entryId: option.application
        };

        var application = Collections.Applications.findOne(cond);
        if (!application) return false;

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
        return result;
    },

    /**
     * Delete mail template
     * @param _id {String} Mongo id
     */
    deleteMailTemplate: function (_id) {
        check(_id, String);
        return Collections.MailTemplates.remove(_id);
    },

    uploadCompanyLogo: function (file) {
        var user = Collections.Users.findOne({userId: parseInt(this.userId)});
        if (user) {
            Collections.Companies.update({companyId: user.data.companyid}, {$set: {logo: file}});
        }
    },

    /**
     * Get candidate info
     * @param candidateId {Number}
     */
    getCandidateInfo: function (candidateId) {
        check(candidateId, Number);
        var conditions = {
            userId: candidateId
        };
        var options = {
            limit: 1,
            fields: {
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
            }
        };
        return Collections.Candidates.findOne(conditions, options);
    },

    /**
     * Get application details
     * @param opt {Object}
     */
    getApplicationDetails: function (applicationId) {
        // validate client request
        check(applicationId, Number);

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
        check(opt, {
            jobId: Number,
            stage: Number
        });

        var application = Collections.Applications.findOne({
            jobId: opt.jobId,
            stage: opt.stage
        }, {sort: {matchingScore: -1}});

        if (application) {
            return application.entryId;
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
        check(opt, {
            jobId: Number,
            stage: Number,
            application: Number
        });
        var conditions = {
            jobId: opt.jobId,
            stage: opt.stage,
            entryId: opt.application
        };
        return !!Collections.Applications.find(conditions).count();
    },

    /**
     * Get activities
     * @param opt {Object}
     */
    getActivities: function (opt) {
        // validate client request
        check(opt, {
            application: Number,
            page: Number
        });

        var DEFAULT_LIMIT = 10;
        var skip = 0;
        if (opt.page > 0) {
            skip = (opt.page - 1) * DEFAULT_LIMIT;
        }
        var total = opt.page * DEFAULT_LIMIT;

        var conditions = {
            "data.applicationId": opt.application
        };

        var options = {
            skip: skip,
            limit: DEFAULT_LIMIT,
            sort: {
                createdAt: -1
            }
        };
        var items = Collections.Activities.find(conditions, options);
        var count = Collections.Activities.find(conditions).count();
        return {
            items: items.fetch(),
            loadMoreAbility: (count - total) > 0
        };
    },

    /**
     * Update application qualify
     * @param applicationId {Number}
     */
    disqualifyApplication: function (applicationId) {
        this.unblock();
        check(applicationId, Number);
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
    },
    /**
     * Update application qualify
     * @param applicationId {Number}
     */
    revertApplication: function (applicationId) {
        check(applicationId, Number);
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
        return result;
    },

    /**
     * Update company mail signature
     * @param signature {String} weak - html content
     */
    updateMailSignature: function (signature) {
        check(signature, String);
        var user = Collections.Users.findOne({userId: parseInt(this.userId)});
        var cond = {
            companyId: user.data.companyid
        };
        var modifier = {
            $set: {
                mailSignature: signature
            }
        };
        return Collections.CompanySettings.update(cond, modifier);
    },

    /**
     * Send email to candidate
     * @param data {Object}
     * @param data.application {Number}
     * @param data.subject {String}
     * @param data.content {String}
     */
    sendMailToCandidate: function (data) {
        check(data, {
            application: Number,
            mailTemplate: String,
            subject: String,
            content: String
        });
        var self = this;
        var user = getUserInfo(+this.userId);

        var mailTemplate = Collections.MailTemplates.findOne(data.mailTemplate);
        if (!mailTemplate) {
            var from = user.username;
        } else {
            var from = mailTemplate.emailFrom;
        }

        var application = Collections.Applications.findOne({entryId: data.application, companyId: user.companyId});
        if (!application) return false;
        var candidate = Collections.Candidates.findOne({candidateId: application.candidateId});
        if (!candidate) return false;
        var to = candidate.data.email1 || candidate.data.email2 || candidate.data.username;

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

        return true;
    },

    /**
     * Add comment to application
     * @param data {Object}
     * @param data.application {Number}
     * @param data.content {String}
     */
    addCommentApplication: function (data) {
        check(data, {
            application: Number,
            content: String
        });
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


    getJobsWithStats: function (filters, options) {
        check(filters, Object);
        check(options, Match.Optional(Object));
        var user = getUserInfo(+this.userId);
        var DEFAULT_FILTERS = {
            companyId: user.companyId
        };
        filters = _.defaults(DEFAULT_FILTERS, filters);
        options = _.defaults(options, DEFAULT_JOB_OPTIONS);

        if (!options.hasOwnProperty('limit')) {
            options.limit = 5;
        }

        var mapStats = function (doc) {
            doc.stages = {};
            _.each(Recruit.APPLICATION_STAGES, function (stage) {
                var cond = {
                    jobId: doc.jobId,
                    stage: stage.id,
                    companyId: user.companyId
                };
                doc.stages[stage.id] = Collections.Applications.find(cond, {fields: {_id: 1}}).count();
            });
            return doc;
        }
        return {
            jobs: Collections.Jobs.find(filters, options).map(mapStats),
            total: Collections.Jobs.find(filters).count()
        };
    },

    getJobStagesCount: function (jobId) {
        this.unblock();
        check(jobId, Number);
        var user = getUserInfo(+this.userId);
        var stages = {};
        _.each(Recruit.APPLICATION_STAGES, function (stage) {
            var cond = {
                jobId: jobId,
                stage: stage.id,
                companyId: user.companyId
            };
            stages[stage.id] = Collections.Applications.find(cond, {fields: {_id: 1}}).count();
        });
        return stages;
    },

    getJobStageCount: function (filters) {
        this.unblock();
        check(filters, {
            jobId: Number,
            stage: Number
        });
        var user = getUserInfo(+this.userId);
        var cond = {
            companyId: user.companyId,
            jobId: filters.jobId,
            stage: filters.stage
        };
        return Collections.Applications.find(cond, {fields: {_id: 1}}).count();
    },

    activityCount: function (filters) {
        this.unblock();
        check(filters, Object);
        var user = getUserInfo(+this.userId);
        filters["companyId"] = user.companyId;
        return Collections.Activities.find(filters, {fields: {_id: 1}}).count();
    },


    getApplications: function (filters, options) {
        check(filters, Object);
        check(options, Match.Optional(Object));

        var user = getUserInfo(+this.userId);

        // Limit find applications in company owned
        var DEFAULT_FILTERS = {
            companyId: user.companyId
        };

        filters = _.defaults(DEFAULT_FILTERS, filters);

        options = _.extend(DEFAULT_OPTIONS_VALUES, options);
        options = _.defaults(DEFAULT_APPLICATION_OPTIONS, options);

        return Collections.Applications.find(filters, options).map(function (doc) {

            doc.candidate = Collections.Candidates.findOne({candidateId: doc.candidateId}, DEFAULT_APPLICATION_OPTIONS);
            return doc;
        });
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
        console.log(oldValue);
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
            listEmail = listEmail.concat(obj.data.emailaddress.split(','));
        });

        return _.unique(listEmail);
    }
})