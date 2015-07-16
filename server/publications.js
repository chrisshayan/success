Meteor.publish('jobs', function(options){
    var cond = {
        userId: parseInt(this.userId)
    };
    return Collections.Jobs.find(cond);
});

Meteor.publish('jobDetails', function(options){
    check(options, {
        jobId: Number
    });

    var cond = {
        jobId: options.jobId,
        userId: parseInt(this.userId)
    };
    return Collections.Jobs.find(cond, {limit: 1});
});

Meteor.publish('applications', function(conditions, options){
    //check(options, {
    //    jobId: Number
    //});
    return Collections.Applications.find(conditions, options);
});

Meteor.publish('applicationCount', function(options){
    var conditions = {};
    if(typeof options == "object") {
        if(options.hasOwnProperty('jobId')) {
            conditions.jobId = options.jobId;
        }
        if(options.hasOwnProperty('stage')) {
            conditions.stage = options.stage;
        }
    }
    return Collections.Applications.find(conditions, {fields: {_id: 1, jobId: 1, stage: 1}});
});

Meteor.publish('candidates', function(options){
    check(options, {
        jobId: Number
    });

    var listCandidateIds = [];
    var jobApplications = Collections.Applications.find({jobId: options.jobId}, {fields: {userId: 1} }).fetch();
    _.each(jobApplications, function(r){
        listCandidateIds.push( r.userId );
    });

    return Collections.Candidates.find({ userId: {$in: listCandidateIds} });
});


Meteor.publish('candidateInfo', function(options){
    return Collections.Candidates.find();
});

Meteor.publish('companyInfo', function(){
    var user = Collections.Users.findOne({userId: parseInt(this.userId)});
    if(user) {
        return Collections.Companies.find({companyId: user.data.companyid}, {limit: 1});
    }
    return null;

});



Meteor.publish('activities', function() {
    var cond = {
        createdBy: parseInt(this.userId)
    };
    var options = {
        sort: {createdAt: -1}
    }
    return Collections.Activities.find(cond, options);
});


Meteor.publish('mailTemplates', function() {
    var cond = {
        createdBy: parseInt(this.userId)
    };
    var options = {
        sort: {createdAt: -1}
    }
    return Collections.MailTemplates.find(cond, options);
});

Meteor.publish('mailTemplateDetails', function(_id) {
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

/**
 * Get applications in job details page
 * @param clientOptions {Object}
 * @param clientOptions.jobId {Number}
 * @param clientOptions.page {Number} (optional)
 */
Meteor.publish('JobApplications', function(opt) {
    // validate client request
    check(opt, {
        jobId: Number,
        stage: Number,
        page: Number
    });

    var DEFAULT_LIMIT = 20;
    var conditions = {
        jobId: opt.jobId,
        stage: opt.stage
    };
    var options = {
        skip: 0,
        limit: opt.page * DEFAULT_LIMIT,
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
            "data.createddate": 1,
            "data.appSubject": 1,
            "data.coverletter": 1
        }
    };
    return Collections.Applications.find(conditions, options);
});

/**
 * Get candidate info in job details page
 */
Meteor.publish('jobCandidateInfo' , function(userId) {
    check(userId, Number);
    var conditions = {
        userId: parseInt(userId)
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
    return Collections.Candidates.find(conditions, options);
});