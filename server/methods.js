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
        if(!application) return false;

        var data = {
            $set: {
                stage: option.stage
            }
        }

        var result = Collections.Applications.update(application._id, data);
        if(result) {
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

    uploadCompanyLogo: function(file) {
        var user = Collections.Users.findOne({userId: parseInt(this.userId)});
        if(user) {
            Collections.Companies.update({companyId: user.data.companyid}, {$set: {logo: file}});
        }
    },

    /**
     * Get job applications
     * @param req
     */
    getApplications: function(opt) {
        // validate client request
        check(opt, {
            jobId: Number,
            stage: Number,
            page: Number
        });

        var DEFAULT_LIMIT = 20;
        var skip = 0;
        if(opt.page > 0) {
            skip = (opt.page - 1) * DEFAULT_LIMIT;
        }
        var total = opt.page * DEFAULT_LIMIT;

        var conditions = {
            jobId: opt.jobId,
            stage: opt.stage
        };
        var options = {
            skip: skip,
            limit: DEFAULT_LIMIT,
            sort: {
                matchingScore: -1
            },
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
        var items = Collections.Applications.find(conditions, options);
        var count = Collections.Applications.find(conditions).count();
        return {
            items: items.fetch(),
            loadMoreAbility: (count - total) > 0
        };
    },

    /**
     * Get candidate info
     * @param candidateId {Number}
     */
    getCandidateInfo: function(candidateId) {
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
    getApplicationDetails: function(applicationId) {
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
    getFirstJobApplication: function(opt) {
        check(opt, {
            jobId: Number,
            stage: Number
        });

        var application = Collections.Applications.findOne({
            jobId: opt.jobId,
            stage: opt.stage
        }, {sort: {matchingScore: -1}});

        if(application) {
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
    checkApplicationInStage: function(opt) {
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
    getActivities: function(opt) {
        // validate client request
        check(opt, {
            application: Number,
            page: Number
        });

        var DEFAULT_LIMIT = 10;
        var skip = 0;
        if(opt.page > 0) {
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
    disqualifyApplication: function(applicationId) {
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
        if(result) {
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
    revertApplication: function(applicationId) {
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
        if(result) {
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
    updateMailSignature: function(signature) {
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
    sendMailToCandidate: function(data) {
        check(data, {
            application: Number,
            mailTemplate: String,
            subject: String,
            content: String
        });
        this.unblock();
        var mailTemplate = Collections.MailTemplates.findOne(data.mailTemplate);
        if(!mailTemplate) return false;

        var application = Collections.Applications.findOne({entryId: data.application});
        if(!application) return false;
        var candidate = Collections.Candidates.findOne({userId: application.userId});

        var mail = {
            to: candidate.data.username,
            from: mailTemplate.emailFrom,
            subject: data.subject,
            html: data.content
        };

        Meteor.Mandrill.send(mail);
        var activity = new Activity();

        mail.applicationId = data.application;
        activity.data = mail;
        activity.sendMailToCandidate();
        return true;
    },

    /**
     * Add comment to application
     * @param data {Object}
     * @param data.application {Number}
     * @param data.content {String}
     */
    addCommentApplication: function(data) {
        check(data, {
            application: Number,
            content: String
        });
        this.unblock();
        var application = Collections.Applications.findOne({entryId: data.application});
        if(!application) return false;
        var activity = new Activity();
        activity.data = {
            applicationId: data.application,
            content: data.content
        };
        activity.addCommentApplication();
        return true;
    }
});