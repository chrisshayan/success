Publications = {};

/**
 * Publish job's applications
 * @param filters
 * @param options
 * @returns {{find: Function, children: Array}}
 */
Publications.getApplications = function (filters, options) {
    if (!this.userId) return this.ready();
    this.unblock();
    return {
        find: function () {
            //check(filters, Object);
            //check(options, Object);

            //filters['isDeleted'] = 0;
            if (!options.hasOwnProperty("limit")) {
                options['limit'] = 20;
            } else {
                options['limit'] += 10;
            }
            return Application.getCollection().find(filters, options);
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
Publications['applications.lastApplications'] = function () {
    if (!this.userId) return null;
    this.unblock();
    const user = Meteor.users.findOne({_id: this.userId});
    if (!user || !user['companyId']) return null;
    return {
        find: function () {
            try {
                let selector = {},
                    options = {
                        limit: 10,
                        sort: {
                            appliedDate: -1
                        }
                    };

                if (user.isCompanyAdmin()) {
                    selector = {
                        companyId: user.companyId
                    };
                } else {
                    const jobSelector = {
                        $or: [
                            {'recruiters.manager.userId': user._id},
                            {'recruiters.recruiter.userId': user._id}
                        ]
                    };
                    const jobIds = JobExtra.find(jobSelector).map((doc) => doc.jobId);
                    if(jobIds.length > 0) {
                        selector = {
                            companyId: user.companyId,
                            jobId: {
                                $in: jobIds
                            }
                        };
                    }
                }

                if(!_.isEmpty(selector)) {
                    return Application.find(selector, options);
                }
                return null;
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
    this.unblock();
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
    this.unblock();
    const user = Meteor.users.findOne({_id: this.userId});
    if(!user || !user['companyId']) return this.ready();
    return {
        find: function () {
            var filters = {companyId: user.companyId, appId: appId};
            return Application.find(filters);
        }
    }
}


/**
 * Map to meteor
 */
_.each(Publications, (func, name) =>  Meteor.publishComposite(name, func));