Meteor.publish('jobs', function(filters){
    check(filters, {
        status: Number,
        limit: Number,
        except: Match.Optional([Number]), // filter except job id
    });

    if(filters.limit < 0)
        filters.limit = 10;

    var cond = {
        userId: parseInt(this.userId)
    };
    var today = new Date(moment().format("YYYY-MM-DD 00:00:00"));
    if(filters.status == 1) {
        cond['data.expireddate'] = {
            $gte: today
        }
    } else {
        cond['data.expireddate'] = {
            $lt: today
        }
    }

    // filter by except
    if( filters.hasOwnProperty('except') ) {
        cond['jobId'] = {
            $nin: filters.except
        }
    }

    var options = {
        limit: filters.limit,
        sort: {
            "data.createddate": -1
        },
        fields: {
            jobId: 1,
            userId: 1,
            "data.jobtitle": 1,
            "data.iscompleted": 1,
            "data.createddate": 1,
            "data.expireddate": 1
        }
    };
    var cursor = Collections.Jobs.find(cond, {fields: {_id: 1}});
    Counts.publish(this, 'jobsStatusCount_' + filters.status, cursor);
    return Collections.Jobs.find(cond, options);
});

Meteor.publish('applicationCount', function(filters){
    check(filters, {
        status: Number,
        limit: Number
    });
    // Get all job ids
    var cond1 = {
        userId: parseInt(this.userId)
    };
    var opt1 = {
        limit: 10,
        sort: {
            "data.createddate": -1
        },
        fields: {
            jobId: 1
        }
    };
    var jobIds = Collections.Jobs.find(cond1, opt1).map(function(r) {
       return r.jobId;
    });

    // return all applications of jobs
    var cond2 = {
        jobId: {$in: jobIds}
    };
    var opt2 = {
        fields: {
            jobId: 1,
            stage: 1
        }
    };
    return Collections.Applications.find(cond2, opt2);
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


Meteor.publish('companyInfo', function(){
    var user = Collections.Users.findOne({userId: parseInt(this.userId)});
    if(user) {
        return Collections.Companies.find({companyId: user.data.companyid}, {limit: 1});
    }
    return null;

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
Meteor.publishRelations('JobApplications', function (opt) {
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
            disqualified: 1,
            "data.createddate": 1,
            "data.appSubject": 1,
            "data.coverletter": 1
        }
    };

    var candidateOptions = {
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

    this.cursor(Collections.Applications.find(conditions, options), function (id, doc) {
        this.cursor(Collections.Candidates.find({userId: doc.userId}, candidateOptions));
    });

    return this.ready();
});

Meteor.publish('applicationActivities', function(opt) {
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
        skip: 0,
        limit: opt.page * DEFAULT_LIMIT,
        sort: {
            createdAt: -1
        }
    };
    return Collections.Activities.find(conditions, options);
});

Meteor.publish('totalActivities', function(opt) {
    // validate client request
    check(opt, {
        application: Number,
        page: Number
    });
    var conditions = {
        "data.applicationId": opt.application
    };

    var options = {
        fields: {
            _id: 1
        }
    };
    var cursor = Collections.Activities.find(conditions, options);
    Counts.publish(this, 'totalActivities', cursor);
});



Meteor.publish('companySettings', function() {
    var user = Collections.Users.findOne({userId: parseInt(this.userId)});
    return Collections.CompanySettings.find({companyId: user.data.companyid}, {limit: 1});
});

/**
 * count applications
 * using package publish count
 * use Counts in client side
 */
Meteor.publish('applicationsCounter', function(options){
    var conditions = {};
    if(typeof options == "object") {
        if(options.hasOwnProperty('jobId')) {
            conditions.jobId = parseInt(options.jobId);
        }
        if(options.hasOwnProperty('stage')) {
            conditions.stage = options.stage;
        }
    }

    var cursor = Collections.Applications.find(conditions, {fields: {_id: 1}});
    switch (options.stage) {
        case 1:
            Counts.publish(this, 'stageAppliedCount', cursor);
        break;
        case 2:
            Counts.publish(this, 'stagePhoneCount', cursor);
            break;
        case 3:
            Counts.publish(this, 'stageInterviewCount', cursor);
            break;
        case 4:
            Counts.publish(this, 'stageOfferCount', cursor);
            break;
        case 5:
            Counts.publish(this, 'stageHiredCount', cursor);
            break;
    }

});
