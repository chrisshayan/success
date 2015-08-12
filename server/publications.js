Meteor.publish('jobDetails', function (options) {
    check(options, {
        jobId: Number
    });
    var cond = {
        jobId: options.jobId,
        userId: parseInt(this.userId)
    };
    return Collections.Jobs.find(cond, {limit: 1});
});


Meteor.publish('companyInfo', function () {
    var user = Collections.Users.findOne({userId: +this.userId});
    if (!user) return;
    return Collections.CompanySettings.find({companyId: user.companyId}, {limit: 1});
});

Meteor.publish('mailTemplates', function () {
    var cond = {
        createdBy: parseInt(this.userId)
    };
    var options = {
        sort: {createdAt: -1}
    }
    return Collections.MailTemplates.find(cond, options);
});

Meteor.publish('mailTemplateDetails', function (_id) {
    check(_id, String);

    var cond = {
        _id: _id,
        createdBy: parseInt(this.userId)
    };

    return Collections.MailTemplates.find(cond);
});


/*************************************
 * Publications for job details page *
 *************************************/


Meteor.publish('companySettings', function () {
    var user = Collections.Users.findOne({userId: parseInt(this.userId)});
    return Collections.CompanySettings.find({companyId: user.data.companyid}, {limit: 1});
});


/**
 * Shared publications
 */
var DEFAULT_OPTIONS_VALUES = {limit: 10},
    DEFAULT_COUNTER_FIELDS = {fields: {_id: 1}},
    DEFAULT_JOB_OPTIONS = {
        fields: {
            jobId: 1,
            userId: 1,
            companyId: 1,
            createdAt: 1,
            "data.jobtitle": 1,
            "data.iscompleted": 1,
            "data.salarymin": 1,
            "data.salarymax": 1,
            "data.skillexperience": 1,
            "data.expireddate": 1,
            "data.emailaddress": 1
        }
    },
    DEFAULT_APPLICATION_OPTIONS = {
        fields: {
            entryId: 1,
            candidateId: 1,
            companyId: 1,
            jobId: 1,
            source: 1,
            stage: 1,
            matchingScore: 1,
            disqualified: 1,
            createdAt: 1,
            "data.appSubject": 1,
            "data.coverletter": 1
        }
    },
    DEFAULT_CANDIDATE_OPTIONS = {
        fields: {
            _id: 1,
            candidateId: 1,
            createdAt: 1,
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
            "data.cellphone": 1
        }
    };

Meteor.publish('getJobs', function (filters, options) {
    check(filters, Object);
    check(options, Match.Optional(Object));

    var DEFAULT_FILTERS = {
        userId: parseInt(this.userId)
    };

    filters = _.defaults(filters, DEFAULT_FILTERS);
    options = _.defaults(options, DEFAULT_JOB_OPTIONS);
    if (!options.hasOwnProperty("limit")) {
        options['limit'] = 10;
    }
    return Collections.Jobs.find(filters, options);
});


Meteor.publishComposite('getApplications', function (filters, options) {
    return {
        find: function() {
            if(!this.userId) return [];
            check(filters, Object);
            check(options, Object);
            var user = Collections.Users.findOne({userId: +this.userId}, {fields: {userId: 1, companyId: 1}});
            if (!user) return;
            filters['companyId'] = user.companyId;

            options = _.defaults(options, DEFAULT_APPLICATION_OPTIONS);
            if (!options.hasOwnProperty("limit")) {
                options['limit'] = 20;
            }
            return Collections.Applications.find(filters, options);
        },
        children: [
            {
                find: function(application) {
                    var cond = {
                        candidateId: application.candidateId
                    };
                    var options = DEFAULT_CANDIDATE_OPTIONS;
                    options.limit = 1;
                    return Collections.Candidates.find(cond, options)
                }
            }
        ]
    }
});

Meteor.publish('getApplications1', function (filters, options) {
    check(filters, Object);
    check(options, Object);
    var user = Collections.Users.findOne({userId: +this.userId}, {fields: {userId: 1, companyId: 1}});
    if (!user) return;
    var cursors = [];
    filters['companyId'] = user.companyId;

    options = _.defaults(options, DEFAULT_APPLICATION_OPTIONS);
    if (!options.hasOwnProperty("limit")) {
        options['limit'] = 20;
    }
    var applicationCursor = Collections.Applications.find(filters, options);
    cursors.push( applicationCursor );
    var canIds = applicationCursor.map(function (doc) {
        return doc.candidateId
    });
    if(canIds.length > 0) {
        var canOptions = DEFAULT_CANDIDATE_OPTIONS;
        canOptions["limit"] = canIds.length;
        var canCursor = Collections.Candidates.find({candidateId: {$in: canIds}}, canOptions);
        cursors.push( canCursor );
    }
    return cursors;
});

Meteor.publish('getApplicationDetails', function (applicationId) {
    check(applicationId, Number);
    var user = Collections.Users.findOne({userId: +this.userId}, {fields: {userId: 1, companyId: 1}});

    var appCursor = Collections.Applications.find({
        companyId: user.companyId,
        applicationId: applicationId
    }, DEFAULT_APPLICATION_OPTIONS);

    var canIds = appCursor.map(function (doc) {
        return doc.candidateId
    });
    var canCursor = Collections.Candidates.find({candidateId: {$in: canIds}})

    return [appCursor, canCursor];
});


Meteor.publish('applicationActivities', function (filters, options) {
    check(filters, Object);
    check(options, Object);
    var user = Collections.Users.findOne({userId: +this.userId}, {fields: {userId: 1, companyId: 1}});
    if (!user) return;

    filters['companyId'] = user.companyId;
    return Collections.Activities.find(filters, options);
});

Meteor.publish("jobCounter", function (counterName, filters) {
    var self = this;
    check(counterName, String);
    check(filters, Object);
    var count = 0;
    var initializing = true;
    var user = Collections.Users.findOne({userId: +this.userId}, {fields: {userId: 1, companyId: 1}});
    if (!user) return;

    filters['companyId'] = user.companyId;
    var handle = Collections.Jobs.find(filters).observeChanges({
        added: function (id) {
            count++;
            if (!initializing)
                self.changed("vnw_counts", counterName, {count: count});
        },
        removed: function (id) {
            count--;
            self.changed("vnw_counts", counterName, {count: count});
        }
    });

    initializing = false;
    self.added("vnw_counts", counterName, {count: count});
    self.ready();

    self.onStop(function () {
        handle.stop();
    });
});


Meteor.publish("jobStagesCounter", function (counterName, jobId) {
    var self = this;
    check(counterName, String);
    check(jobId, Number);
    var count = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
    };
    var initializing = true;
    var user = Collections.Users.findOne({userId: +this.userId}, {fields: {userId: 1, companyId: 1}});
    if (!user) return;
    var filters = {
        companyId: user.companyId,
        jobId: jobId
    };
    var options = {
        fields: {
            stage: 1
        }
    }
    var handle = Collections.Applications.find(filters, options).observe({
        added: function (doc) {
            count[doc.stage]++;
            if (!initializing)
                self.changed("vnw_counts", counterName, {count: count});
        },
        changed: function (newDoc, oldDoc) {
            count[oldDoc.stage]--;
            count[newDoc.stage]++;
            self.changed("vnw_counts", counterName, {count: count});
        },
        removed: function (doc) {
            count[doc.stage]--;
            self.changed("vnw_counts", counterName, {count: count});
        }
    });

    initializing = false;
    self.added("vnw_counts", counterName, {count: count});
    self.ready();

    self.onStop(function () {
        handle.stop();
    });
});

Meteor.publish("applicationCounter", function (counterName, filters) {
    var self = this;
    check(counterName, String);
    check(filters, Object);

    var count = 0;
    var initializing = true;
    var user = Collections.Users.findOne({userId: +this.userId}, {fields: {userId: 1, companyId: 1}});
    if (!user) return;
    filters['companyId'] = user.companyId;
    var handle = Collections.Applications.find(filters).observeChanges({
        added: function (id) {
            count++;
            if (!initializing)
                self.changed("vnw_counts", counterName, {count: count});
        },
        removed: function (id) {
            count--;
            self.changed("vnw_counts", counterName, {count: count});
        }
    });

    initializing = false;
    self.added("vnw_counts", counterName, {count: count});
    self.ready();

    self.onStop(function () {
        handle.stop();
    });
});

Meteor.publish("activityCounter", function (counterName, filters) {
    var self = this;
    check(counterName, String);
    check(filters, Object);

    var count = 0;
    var initializing = true;
    var user = Collections.Users.findOne({userId: +this.userId}, {fields: {userId: 1, companyId: 1}});
    if (!user) return;

    filters['companyId'] = user.companyId;
    var handle = Collections.Activities.find(filters).observeChanges({
        added: function (id) {
            count++;
            if (!initializing)
                self.changed("vnw_counts", counterName, {count: count});
        },
        removed: function (id) {
            count--;
            self.changed("vnw_counts", counterName, {count: count});
        }
    });

    initializing = false;
    self.added("vnw_counts", counterName, {count: count});
    self.ready();

    self.onStop(function () {
        handle.stop();
    });
});

Meteor.publishComposite('lastApplications', function () {
    return {
        find: function() {
            if (!this.userId) return this.ready();
            var user = Collections.Users.findOne({userId: +this.userId}, {fields: {userId: 1, companyId: 1}});
            if (!user) return [];

            var cursors = [];
            var filters = {
                companyId: user.companyId
            };

            var options = DEFAULT_APPLICATION_OPTIONS;
            options['limit'] = 10;
            options['sort'] = {
                createdAt: -1
            };

            return Collections.Applications.find(filters, options);
        },
        children: [
            {
                find: function(application) {
                    var cond = {
                        candidateId: application.candidateId
                    };
                    var options = DEFAULT_CANDIDATE_OPTIONS;
                    options.limit = 1;
                    return Collections.Candidates.find(cond, options)
                }
            }
        ]
    }
});
Meteor.publish('lastApplications1', function () {
    if (!this.userId) return [];
    var user = Collections.Users.findOne({userId: +this.userId}, {fields: {userId: 1, companyId: 1}});
    if (!user) return [];

    var cursors = [];
    var filters = {
        companyId: user.companyId
    };

    var options = DEFAULT_APPLICATION_OPTIONS;
    options['limit'] = 10;
    options['sort'] = {
        createdAt: -1
    };

    var applicationCursor = Collections.Applications.find(filters, options);
    cursors.push( applicationCursor );
    var canIds = applicationCursor.map(function (doc) {
        return doc.candidateId
    });
    if(canIds.length > 0) {
        var canOptions = DEFAULT_CANDIDATE_OPTIONS;
        canOptions["limit"] = canIds.length;
        var canCursor = Collections.Candidates.find({candidateId: {$in: canIds}}, canOptions);
        cursors.push( canCursor );
    }
    return cursors;
});


Meteor.publish('lastOpenJobs', function () {
    if (!this.userId) return [];
    var user = Collections.Users.findOne({userId: +this.userId}, {fields: {userId: 1, companyId: 1}});
    if (!user) return [];

    var today = new Date(moment().format("YYYY-MM-DD 00:00:00"));
    var filters = {
        companyId: user.companyId,
        'data.expireddate': {
            $gte: today
        }
    };

    var options = DEFAULT_JOB_OPTIONS;
    options['limit'] = 10;
    options['sort'] = {
        createdAt: -1
    };


    return Collections.Jobs.find(filters, options);
});

