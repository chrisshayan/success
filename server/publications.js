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

Meteor.publish('applications', function(options){
    check(options, {
        jobId: Number
    });
    return Collections.Applications.find(options);
});

Meteor.publish('applicationCount', function(options){
    return Collections.Applications.find({}, {fields: {_id: 1, jobId: 1}});
});

Meteor.publish('applicationScores', function(options){
    return Collections.ApplicationScores.find({});
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