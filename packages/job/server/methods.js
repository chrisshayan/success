/**
 * Created by HungNguyen on 8/21/15.
 */


var methods = {
    updateJob: function (job, data) {
        if (Core.isLoggedIn()) return false;

        if (!data) return false;

        var query = {
            _id: job._id
        };
        var modifier = Core.setModifier(data);

        return Core.doUpdate(Collection, query, modifier);
    },

    publishPosition: function (doc) {
        console.log(doc);
    },

    jobListCounter(filter) {
        if(!this.userId) return 0;
        var user = Meteor.users.findOne({_id: this.userId});
        var permissions = user.jobPermissions();

        filter = _.pick(filter, 'status', 'source', 'recruiterEmails');
        filter['$or'] = permissions;

        return Collections.Jobs.find(filter).count();
    },

    updateJobTags: function (jobId, tags) {
        check(jobId, String);
        check(tags, [String]);
        if (!this.userId) return false;
        var job = Collections.Jobs.findOne({_id: jobId});
        if (!job) return false;
        var newTags = [];
        _.each(tags, function (t) {
            newTags.push(t.toLowerCase());
        });

        var diff = _.difference(newTags, job.tags || []);
        _.each(diff, function (newSkill) {
            Collections.SkillTerms.upsert({skillName: newSkill}, {
                $set: {
                    skillId: null,
                    skillName: newSkill,
                    skillLength: newSkill.length
                }
            });
        });
        return Collections.Jobs.update({_id: job._id}, {$set: {tags: newTags}});
    }
};


Meteor.methods(methods);
