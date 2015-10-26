/**
 * Created by HungNguyen on 8/21/15.
 */


/**
 * Created by HungNguyen on 8/21/15.
 */
function initJobCriteriaSet(job) {
    if (Meteor.job_criteria_set.find({jobId: job._id}).count() >= 4) return true;
    var templates = Meteor.job_criteria_set_templates.find({companyId: {$exists: false}}, {limit: 4}).fetch();
    _.each(templates, function (template) {
        var criteriaSet = _.pick(template, 'name', 'hint', 'description');
        criteriaSet.templateId = template._id;
        criteriaSet.jobId = job._id;
        criteriaSet.companyId = job.companyId;
        new JobCriteriaSet(criteriaSet).save()
    });
}

var publications = {
    currentJobCriteria: function (filter) {
        if (!this.userId) return this.ready();
        filter = _.pick(filter, 'jobId');
        check(filter, {
            jobId: String
        });

        var job = Collections.Jobs.findOne({_id: filter.jobId});
        if (!job) return this.ready();
        return {
            find: function () {
                Meteor.defer(function () {
                    initJobCriteriaSet(job);
                });
                return Meteor.job_criteria_set.find(filter);
            },
            children: [
                {
                    /**
                     * return job criteria
                     * @param criteriaSet
                     */
                    find: function (criteriaSet) {
                        return Meteor.job_criteria.find({criteriaSetId: criteriaSet._id});
                    }
                }
            ]
        };
    }
};


_.each(publications, (func, name) => {
    Meteor.publishComposite(name, func);
});


