Publications = {};

/**
 * Publish job's applications
 * @param filters
 * @param options
 * @returns {{find: Function, children: Array}}
 */
Publications.getApplications = function (filters, options) {
    if (!this.userId) return this.ready();
    return {
        find: function () {
            //check(filters, Object);
            //check(options, Object);

            filters['isDeleted'] = 0;
            if (!options.hasOwnProperty("limit")) {
                options['limit'] = 20;
            } else {
                options['limit'] += 10;
            }
            return Collections.Applications.find(filters, options);
        },
        children: [
            //{
            //    find: function (app) {
            //        return Collections.Candidates.find({candidateId: app.candidateId}, {limit: 1});
            //    }
            //}
        ]
    }
};

/**
 * Publish 10 latest applications of open jobs
 * @returns {*}
 */
Publications.lastApplications = function () {
    if (!this.userId) return null;
    var self = this;
    return {
        find: function () {
            try {
                var user = Meteor.users.findOne({_id: self.userId});
                if (!user) return [];
                var jobPermissions = user.jobPermissions();
                var jobIds = Collections.Jobs.find({status: 1, $or: jobPermissions}).map(function (r) {
                    return r.jobId
                });
                jobIds = _.filter(jobIds, (v) => v != void 0);

                var filters = {
                    jobId: {$in: jobIds},
                    source: {$ne: 3},
                    isDeleted: 0
                };

                var options = {};
                options['limit'] = 10;
                options['sort'] = {
                    createdAt: -1
                };
                return Collections.Applications.find(filters, options);
            } catch (e) {
                console.trace('Last applications:', e);
                return null;
            }
        }
    }
};

/**
 * Publish application details
 * @param data
 * @returns {*}
 */
Publications.applicationDetails = function (data) {
    if (!this.userId) return this.ready();
    check(data.application, String);
    var self = this;
    var user = Meteor.users.findOne({_id: this.userId});
    return {
        find: function () {

            if (!user.canViewApplication(data.application))
                var filters = {
                    _id: data.application
                };
            var options = {};
            options['limit'] = 1;
            return Collections.Applications.find(filters, options);
        },
        children: [
            {
                find: function (application) {
                    var cond = {
                        candidateId: application.candidateId
                    };
                    var options = {};
                    options.limit = 1;
                    return Meteor.candidates.find(cond, options);
                }
            }
        ]
    }
};

Publications.application = function (appId) {
    if (!this.userId || !appId) return this.ready();
    check(appId, String);
    var user = Meteor.users.findOne({_id: this.userId});
    return {
        find: function () {
            if (!user.canViewApplication(appId)) return null;
            var filters = { _id: appId };
            var options = { limit: 1 };
            return Collections.Applications.find(filters, options);
        },
        children: [
            {
                find: function (application) {
                    var filters = {
                        candidateId: application.candidateId
                    };
                    var options = {
                        limit: 1
                    };
                    return Collections.Candidates.find(filters, options);
                }
            }
        ]
    }
}


/**
 * Map to meteor
 */
_.each(Publications, (func, name) =>  Meteor.publishComposite(name, func));