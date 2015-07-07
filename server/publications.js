Meteor.publish('jobs', function(options){
    check(options, {
        userId: Number
    });

    console.log(this.userId)

    var cond = {
        userId: options.userId
    };
    return Collections.Jobs.find(cond, {limit: 10});
});

Meteor.publish('jobDetails', function(options){
    check(options, {
        jobId: Number
    });

    var cond = {
        jobId: options.jobId
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

