Collections = {};
/**
 * Collections User Who login as Employer account
 */
Collections.Users = new Mongo.Collection("vnw_users");
Collections.Jobs = new Mongo.Collection("vnw_jobs");
Collections.Applications = new Mongo.Collection("vnw_applications");
Collections.Candidates = new Mongo.Collection("vnw_candidates");
Collections.ApplicationScores = new Mongo.Collection("vnw_application_scores");

/**
 * Job Helpers
 */
Collections.Jobs.helpers({
    title: function () {
        return this.data.jobtitle;
    },
    applied: function () {
        return Collections.Applications.find({jobId: this.jobId}).count();
    }
});


/**
 * Application Helpers
 */
Collections.Applications.helpers({
    candidate: function () {
        return Collections.Candidates.findOne({userId: this.userId});
    },
    matchingScore: function () {
        var score = Collections.ApplicationScores.findOne({entryId: this.entryId});
        if( !score )
            return "0%";
        return score.data.matchingScore + "%";
    }
});

/**
 * Candidate Helpers
 */
Collections.Candidates.helpers({
    fullname: function () {
        return this.data.lastname + " " + this.data.firstname;
    }
});

