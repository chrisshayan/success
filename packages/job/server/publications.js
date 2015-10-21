/**
 * Created by HungNguyen on 8/21/15.
 */

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
        benifits: 1,
        source: 1,
        status: 1,
        createdAt: 1,
        createdBy: 1,
        recruiterEmails: 1,
        tags: 1
    }
};

Meteor.publish('getJobs', function (filters, options, filterEmailAddress) {
    try {
        if (!this.userId) this.ready();

        check(filters, Object);
        check(options, Match.Optional(Object));

        var user = Meteor.users.findOne({_id: this.userId});

        filters = _.pick(filters, 'status', 'source', 'recruiterEmails');
        filters['userId'] = user.vnwId || null;

        options = _.pick(options, 'limit', 'sort');
        options['fields'] = DEFAULT_JOB_OPTIONS['fields'];

        if (!options.hasOwnProperty("limit")) {
            options['limit'] = 5;
        }
        var recruiterFilter = {
            "recruiters.userId": user._id
        };

        return Collections.Jobs.find({$or: [filters, recruiterFilter]}, options);
    } catch (e) {
        debuger(e);
        return this.ready();
    }
});


/*
 };


 Meteor.publish('getJobs', publications.getJobs);

 Meteor.publish('getLatestJob', publications.getLatestJob);
 */


/**
 * Get current job details and 5 relate jobs
 */
Meteor.publish('jobDetails', function (options) {
    if (!this.userId) return null;
    check(options, {
        jobId: String
    });
    var user = Meteor.users.findOne({_id: this.userId});
    var job = Collections.Jobs.findOne({_id: options.jobId});
    if (!job) return null;
    var cond = {
        $or: [
            {
                _id: job._id,
                $or: [
                    {userId: {$in: [user.vnwId, user._id]}},
                    {"recruiters.userId": user._id}
                ]
            },
            {
                status: job.status,
                $or: [
                    {userId: {$in: [user.vnwId, user._id]}},
                    {"recruiters.userId": user._id}
                ]
            }
        ]
    };

    return Collections.Jobs.find(cond, {limit: 6});
});

