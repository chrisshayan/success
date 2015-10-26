/**
 * Created by HungNguyen on 8/21/15.
 */


var methods = {
    addJobCriteria(jobId, criteriaSetId, criteria) {
        if(!this.userId) return false;
        this.unblock();
        var job = Collections.Jobs.findOne({_id: jobId});
        if(!job) return false;
        var criteriaSet = Meteor.job_criteria_set.findOne({_id: criteriaSetId});
        if(!criteriaSet) return false;

        try {
            Meteor.defer(function() {
                var condCheck = {skillName: {$regex: '^' + criteria + '$', $options:'i'}};
                if(Collections.SkillTerms.find(condCheck).count() <= 0) {
                    Collections.SkillTerms.insert({
                        skillId: null,
                        skillName: criteria,
                        skillLength: criteria.length
                    });
                }
            });

            return new JobCriteria({
                jobId: job._id,
                companyId: job.companyId,
                criteriaSetId: criteriaSet._id,
                label: criteria
            }).save();
        } catch (e) {
            console.log('add Criteria error');
            console.trace(e);
            return false;
        }
    },

    removeJobCriteria(_id) {
        if(!this.userId) return false;
        var criteria = Meteor.job_criteria.findOne({_id: _id});
        if(!criteria) return false;
        return criteria.remove();
    }

};

Meteor.methods(methods);
