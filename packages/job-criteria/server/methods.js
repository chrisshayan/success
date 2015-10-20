/**
 * Created by HungNguyen on 8/21/15.
 */


var methods = {
    addCriteria: function (company_id, criteriaSet) {
        try {
            if (Core.isLoggedIn() || typeof company_id != 'string' || typeof criteriaSet != 'object')
                return false;

            var criteria = new JobCriteria();
            criteria.company_id = company_id;
            criteria.category = criteriaSet;

            return criteria.save();
        } catch (e) {
            console.log('add Criteria error');
            console.trace(e);
            return false;
        }
    },

    updateCriteria: function (criteria_id, updateCriteriaSet) {
        try {
            if (Core.isLoggedIn() || typeof company_id != 'string' || typeof criteriaSet != 'object')
                return false;

            var query = {_id: criteria_id};
            var modifier = Core.setModifier(updateCriteriaSet);

            return Core.doUpdate(Collection, query, modifier);

        }
        catch (e) {
            console.log('add Criteria error');
            console.trace(e);
            return false;

        }
    },
    getCriteria: function (jobId) {
        var result = false;
        if (jobId != void 0) {
            var options = {
                fields: {
                    criteriaId: 1
                }
            };

            //var job = Meteor.jobs.findOne({jobId: jobId}, options);
            var job = Collections.Jobs.findOne({jobId: jobId}, options);
            if (job) {
                result = Meteor['job_criteria'].findOne({_id: job.criteriaId});
                console.log(result);
                if (!result) {
                    var defaultCategory = Core.getConfig('job-criteria', 'DEFAULT_CATEGORY');
                    var criteriaSet = new JobCriteria();
                    criteriaSet.jobId = '' + jobId;
                    criteriaSet.category = defaultCategory;
                    criteriaSet.save();
                    //job.criteriaId = criteriaSet._id;

                    Collections.Jobs.update({jobId: jobId}, {$set: {criteriaId: criteriaSet._id}});
                    //Meteor['jobs']['criteriaId'] = criteriaSet._id;
                    result = criteriaSet;
                }
            }
        }

        return result;
    }
};


Meteor.methods(methods);
