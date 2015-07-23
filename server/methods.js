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
                        console.log(replaces);
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
            companyId: 1
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
        var cond = {
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
                userId: 1,
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
        var application = Collections.Applications.findOne(conditions, options);
        var candidate = Collections.Candidates.findOne({userId: application.userId}, canOptions);
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
        check(applicationId, Number);
        var conditions = {
            entryId: applicationId
        };
        var modifier = {
            $set: {
                disqualified: true
            }
        }
        var result = Collections.Applications.update(conditions, modifier);
        if (result) {
            // Log activity
            var activity = new Activity();
            activity.createdBy = this.userId;
            activity.data = {
                applicationId: applicationId
            };
            activity.disqualifiedApplication();
        }
        return result;
    },
    /**
     * Update application qualify
     * @param applicationId {Number}
     */
    revertApplication: function (applicationId) {
        check(applicationId, Number);
        var conditions = {
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
            activity.createdBy = this.userId;
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

        var mailTemplate = Collections.MailTemplates.findOne(data.mailTemplate);
        if (!mailTemplate) return false;

        var application = Collections.Applications.findOne({entryId: data.application});
        if (!application) return false;
        var candidate = Collections.Candidates.findOne({userId: application.userId});

        var mail = {
            to: candidate.data.username,
            from: mailTemplate.emailFrom,
            subject: data.subject,
            html: data.content
        };

        Meteor.defer(function () {
            mail = replacePlaceholder(self.userId, application, candidate, mail);
            Meteor.Mandrill.send(mail);
            var activity = new Activity();

            mail.applicationId = data.application;
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
        var application = Collections.Applications.findOne({entryId: data.application});
        if (!application) return false;
        var activity = new Activity();
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

    getJobStagesCount: function(jobId) {
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


    getJobsWithStats: function (filters, options) {
        check(filters, Object);
        check(options, Match.Optional(Object));
        var user = getUserInfo(+this.userId);
        var DEFAULT_FILTERS = {
            userId: user.userId,
            companyId: user.companyId
        };

        filters = _.defaults(DEFAULT_FILTERS, filters);
        options = _.extend(DEFAULT_OPTIONS_VALUES, options);
        options = _.defaults(DEFAULT_JOB_OPTIONS, options);

        // get the number of application
        var jobStats = function (job) {
            job.stats = {
                views: job.data.noofviewed,
                stages: {}
            };

            _.each(Recruit.APPLICATION_STAGES, function (stage) {
                var cond = {
                    jobId: job.jobId,
                    stage: stage.id
                };
                job.stats.stages[stage.id] = Collections.Applications.find(cond, {fields: {_id: 1}}).count();
            });

            return job;
        }
        return {
            jobs: Collections.Jobs.find(filters, options).map(jobStats),
            total: Collections.Jobs.find(filters, DEFAULT_COUNTER_FIELDS).count()
        };
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
    }

})
;