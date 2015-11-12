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
        //console.log(filters, options);

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

    addJob: function (data) {

        var job = new vnwJob(data);

        if (!this.userId) return false;

        var currentUser = Meteor.users.findOne({_id: this.userId});

        if (!currentUser.companyId) {
            var listCompanyByUser = Meteor.call('getCompanyListByUser');

            if (listCompanyByUser.length) {
                job.companyId = listCompanyByUser[0].companyId
            }
        }

        if (currentUser) {
            job.companyId = job.companyId || currentUser.companyId || -1;
            job.data = {};
            job.source = {
                type: 2
            };
            job.status = 1;
            job.createdAt = new Date();
            job.updatedAt = new Date();
            job.expiredAt = new Date();
            job.createdBy = this.userId;
            job.userId = this.userId;

            //var jobId = Collections.Jobs.insert(data);
            job.save();

            return job._id;

            /*if (jobId) {
             Collections.Jobs.update({_id: jobId}, {
             $set: {
             jobId: jobId
             }
             });
             }
             return jobId;*/
        }
        return false;
    },

    updateJobAT: function (modifier, _id) {
        return Collection.update({_id: _id}, modifier);
    },

    updateJobsAT: function (modifier, _id) {
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

    updateJobTags: function (_id, tags) {
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
        //return Collections.Jobs.update({_id: job._id}, {$set: {tags: newTags}});
        return Meteor['jobs'].update({_id: job._id}, {$set: {tags: newTags}});

    },


    assignJobRecruiter: function (jobId, role, userId) {

        if (this.userId) {
            var job = Collection.findOne({_id: jobId});
            if (job) {
                job.recruiters = job.recruiters || [];
                var recruiterIndex = _.findIndex(job.recruiters, {userId: userId});

                if (recruiterIndex >= 0) {
                    var roleArray = job.recruiters[recruiterIndex].roles;
                    if (roleArray.indexOf(role) < 0) {
                        roleArray.push(role);
                        job.save();
                    }

                } else {
                    var recruiterObj = {
                        userId: userId,
                        roles: [role]
                    };
                    job.recruiters.push(recruiterObj);

                    job.save();
                }

                return job._id;
            }
        }
        return null;
    },

    unassignJobRecruiter: function (jobId, role, userId) {

        if (this.userId) {
            var job = Collection.findOne({_id: jobId});
            if (job) {
                job.recruiters = job.recruiters || [];
                var recruiterIndex = _.findIndex(job.recruiters, {userId: userId});

                if (recruiterIndex >= 0) {
                    var roleArray = job.recruiters[recruiterIndex].roles;
                    var roleIndex = roleArray.indexOf(role);
                    if (roleIndex >= 0) {
                        roleArray.splice(roleIndex, 1);
                        if (roleArray.length == 0) {
                            job.recruiters.splice(recruiterIndex, 1);
                        }
                        job.save();
                    }

                }

                return job._id;
            }
        }
        return null;
    },

    publishPosition: function (doc) {
        console.log('pub', doc);
    },

    jobListCounter(filter) {
        if (!this.userId) return 0;
        //console.log(filter);
        var user = Meteor.users.findOne({_id: this.userId});
        var permissions = user.jobPermissions();

        filter = _.pick(filter, 'status', 'source', 'recruiterEmails');
        filter['$or'] = permissions;

        return Collection.find(filter).count();
    },

    updateJobTags: function (jobId, tags) {
        check(jobId, String);
        check(tags, [String]);
        if (!this.userId) return false;
        var job = Collection.findOne({_id: jobId});
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
        return Collection.update({_id: job._id}, {$set: {tags: newTags}});
    },

};


Meteor.methods(methods);
