function transformVNWId(id) {
    if (_.isNaN(+id))
        return id;
    return +id;
}


Meteor.publish('companyInfo', function () {
    if (!this.userId) return this.ready();
    var user = Meteor.users.findOne({_id: this.userId});
    if (!user) return;
    return Collections.CompanySettings.find({companyId: user.companyId}, {limit: 1});
});

Meteor.publish('mailTemplates', function () {
    if (!this.userId) return this.ready();
    var user = Meteor.users.findOne({_id: this.userId});
    var company = user.defaultCompany();

    return Collections.MailTemplates.find({
        companyId: company.companyId
    }, {
        sort: {
            createdAt: -1
        }
    });
});

Meteor.publish('mailTemplateDetails', function (_id) {
    if (!this.userId) return null;
    check(_id, String);
    var cond = {
        _id: _id,
    };
    return Collections.MailTemplates.find(cond);
});


/*************************************
 * Publications for job details page *
 *************************************/
Meteor.publish('companySettings', function () {
    var user = Meteor.users.findOne({_id: this.userId});
    return Collections.CompanySettings.find({companyId: user.companyId}, {limit: 1});
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
            title: 1,
            level: 1,
            categories: 1,
            locations: 1,
            salaryMin: 1,
            salaryMax: 1,
            showSalary: 1,
            description: 1,
            requirements: 1,
            benefits: 1,
            source: 1,
            status: 1,
            createdAt: 1,
            createdBy: 1,
            recruiterEmails: 1,
            tags: 1
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
            fullname: 1,
            candidateInfo: 1,
            "data.appSubject": 1,
            "data.coverletter": 1,
            "data.resumeid": 1,
            "isDeleted": 1
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
            "data.cellphone": 1,
            "data.firstName": 1,
            "data.lastName": 1,
            "data.headline": 1,
            "data.email": 1,
            "data.phone": 1,
            "data.source": 1,
            "data.otherSource": 1,
            "data.profileLink": 1,
            "data.comment": 1,
            "data.skills": 1
        }
    };


//Meteor.publishComposite('getApplications', function (filters, options) {
//
//    return {
//        find: function () {
//            if (!this.userId) return this.ready();
//            check(filters, Object);
//            check(options, Object);
//
//            filters['isDeleted'] = 0;
//            options = _.defaults(options, DEFAULT_APPLICATION_OPTIONS);
//            if (!options.hasOwnProperty("limit")) {
//                options['limit'] = 20;
//            } else {
//                options['limit'] += 10;
//            }
//            return Collections.Applications.find(filters, options);
//        },
//        children: [
//            //{
//            //    find: function (application) {
//            //        var cond = {
//            //            candidateId: application.candidateId
//            //        };
//            //        var options = DEFAULT_CANDIDATE_OPTIONS;
//            //        options.limit = 1;
//            //        return Collections.Candidates.find(cond, options)
//            //    }
//            //}
//        ]
//    }
//});


//
//Meteor.publish('getApplicationDetails', function (applicationId) {
//    if(!this.userId) return this.ready();
//    check(applicationId, Number);
//    var appCursor = Collections.Applications.find({
//        companyId: user.companyId,
//        applicationId: applicationId
//    }, DEFAULT_APPLICATION_OPTIONS);
//
//    var canIds = appCursor.map(function (doc) {
//        return doc.candidateId
//    });
//    var canCursor = Collections.Candidates.find({candidateId: {$in: canIds}})
//
//    return [appCursor, canCursor];
//});


Meteor.publish('applicationActivities', function (filters, options) {
    if (!this.userId) return this.ready();
    check(filters, Object);
    check(options, Object);
    if (filters.limit) {
        filters.limit += 10;
    }
    return Collections.Activities.find(filters, options);
});

/*Meteor.publish("applicationCounter", function (counterName, filters) {
 if (!this.userId) return this.ready();
 var self = this;
 check(counterName, String);
 check(filters, Object);

 var count = 0;
 var initializing = true;
 var user = Meteor.users.findOne({_id: this.userId}, {fields: {userId: 1, companyId: 1}});
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
 });*/

Meteor.publish("activityCounter", function (counterName, filters) {
    if (!this.userId) return this.ready();
    var self = this;
    check(counterName, String);
    check(filters, Object);

    var count = 0;
    var initializing = true;
    var user = Meteor.users.findOne({_id: this.userId}, {fields: {userId: 1, companyId: 1}});
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

//Meteor.publish('lastApplications', function () {
//    if (!this.userId) return null;
//    try {
//        var user = Meteor.users.findOne({_id: this.userId}, {fields: {userId: 1, companyId: 1}});
//        if (!user) return [];
//
//        var filters = {
//            source: {$ne: 3},
//            companyId: user.companyId,
//            isDeleted: 0
//        };
//
//        var options = DEFAULT_APPLICATION_OPTIONS;
//        options['limit'] = 10;
//        options['sort'] = {
//            createdAt: -1
//        };
//
//        return Collections.Applications.find(filters, options);
//    } catch (e) {
//        console.log('Last applications:', e);
//        return false;
//    }
//});


Meteor.publish('staticModels', function () {
    if (!this.userId) return this.ready();
    var query = {languageId: 2};

    return [Collections.Degrees.find(query)
        , Collections.Cities.find(query)];
});

/*
 Meteor.publish('addJobPage', function () {
 if (!this.userId) return this.ready();
 var cursors = [];
 var jobLevels = Meteor.job_levels.find();
 var industries = Meteor.industries.find();
 var cities = Meteor.cities.find();

 cursors.push(jobLevels);
 cursors.push(industries);
 cursors.push(cities);
 return cursors;
 });
 */


Meteor.publish('searchSkillAutocomplete', function (selector, options) {
    if (!this.userId) return this.ready();
    if (!options) options = {};
    options['sort'] = {skillLength: 1};
    var cursor = Collections.SkillTerms.find(selector, options);
    Autocomplete.publishCursor(cursor, this);
    return this.ready();
});

Meteor.publishComposite('teamSettings', function (jobId) {
    if (!this.userId) return this.ready();
    check(jobId, Match.Any);
    return {
        find: function () {
            //return Collections.Jobs.find({_id: jobId}, {limit: 1});
            return Meteor['jobs'].find({_id: jobId}, {limit: 1});
        },
        children: [
            {
                find: function (job) {
                    var userIds = _.pluck(job.recruiters || [], 'userId');
                    return userIds.length > 0 ? Meteor.users.find({_id: {$in: userIds}}) : null;
                }
            }
        ]
    }
});

Meteor.publish('recruiterSearch', function (filter, option) {
    if (!this.userId) return this.ready();
    var user = Meteor.users.findOne({_id: this.userId});
    var company = user.defaultCompany();
    var userIds = Meteor['hiringTeam'].find({companyId: company.companyId}).map(function (r) {
        return r.userId;
    });
    filter['_id'] = {
        $in: userIds
    };
    return Meteor.users.find(filter, option);
});

Meteor.publish('skillSearch', function (q) {
    check(q, String);
    if (!this.userId) return this.ready();
    q = q.trim();
    if (q.length < 1) return this.ready();

    var option = {
        sort: {skillLength: 1},
        limit: 10
    };
    return Collections.SkillTerms.find({$text: {$search: q}}, option);

});