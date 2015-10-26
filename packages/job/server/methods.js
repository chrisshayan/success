/**
 * Created by HungNguyen on 8/21/15.
 */


var methods = {
    jobCounter: function (filters) {
        this.unblock();

        var user = Meteor.users.findOne({_id: Meteor.userId});

        if (!filters || typeof filters != 'object' || !user)
            return 0;

        filters.companyId = user.companyId;

        return Collection.find(filters).count();
    },

    getJobs: function (filters, options) {

        if (!filters || typeof filters != 'object' || !options || typeof options != 'object')
            return null;

        var user = Meteor.users.findOne({_id: Meteor.userId});

        filters.companyId = user.companyId;

        var defaultOptions = Core.getConfig('job', 'DEFAULT_OPTIONS_VALUES');
        var defaultJobOptions = Core.getConfig('job', DEFAULT_JOB_OPTIONS);

        options = (defaultOptions) ? _.extend(defaultOptions, options) : options;
        options = (defaultJobOptions) ? _.defaults(defaultJobOptions, options) : options;

        return Collection.find(filters, options).fetch();
    },

    addJob: function () {
        return false;
    },

    updateJobAT: function (modifier, _id) {
        console.log('modified : ', modifier);
        console.log('id : ', _id);
        return Collection.update({_id: _id}, modifier);
    },

    updateJobsAT: function (modifier, _id) {
        console.log('modified : ', modifier);
        console.log('id : ', _id);
        return Collection.update({_id: _id}, modifier, {multi: true});
    },

    updateJob: function (job, data) {
        if (Core.isLoggedIn()) return false;

        if (!data) return false;

        var query = {
            _id: job._id
        };
        var modifier = Core.setModifier(data);

        return Core.doUpdate(Collection, query, modifier);
    },

    updateJobsTag: function (_id, tags) {
        if (typeof tags !== 'object' || !tags.length || _id == void 0 || this.userId == void 0)
            return false;

        var job = Collection.findOne({_id: _id});
        if (!job) return false;
        var newTags = [];

        _.each(tags, function (t) {
            newTags.push(t.trim().toLowerCase());
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

    },

    publishPosition: function (doc) {
        console.log(doc);
    }
};


Meteor.methods(methods);
