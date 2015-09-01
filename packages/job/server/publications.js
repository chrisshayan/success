/**
 * Created by HungNguyen on 8/21/15.
 */


Job.publications = {
    getJobByCompanyId: function (companyId, options) {
        if (companyId == void 0) return this.ready();
        return Collection.find({companyId: companyId}, options || {});
    },

    getJobs: function (filters, options, filterEmailAddress) {
        try {
            if (!this.userId()) return this.ready();

            var DEFAULT_FILTERS = {
                userId: this.user().userId
            };

            filters = _.extend(DEFAULT_FILTERS, filters);
            options = _.extend(CONFIG.defaultJobOptions, options);

            if (filterEmailAddress)
                filters.jobEmailTo = new RegExp(filterEmailAddress, 'i');


            if (!options.hasOwnProperty("limit")) {
                options['limit'] = 10;
            }
            return Collection.find(filters, options);
        } catch (e) {
            debuger(e);
            return this.ready();
        }
    },

    getLatestJob: function (filterEmailAddress) {
        if (!this.userId()) this.ready();

        var userOptions = {
            fields: {
                userId: 1, companyId: 1
            }
        };

        var user = UserApi.methods.getUser(this.user().userId, userOptions); //var user = User.model.collection.findOne();

        if (!user) return [];

        var today = new Date(moment().format("YYYY-MM-DD 00:00:00"));
        var filters = {
            companyId: user.companyId,
            expiredDate: {
                $gte: today
            }
        };

        if (filterEmailAddress)
            filters.jobEmailTo = new RegExp(filterEmailAddress, 'i');

        var options = CONFIG.defaultJobOptions;
        options['limit'] = 10;
        options['sort'] = {
            createdAt: -1
        };

        return Collection.find(filters, options);
    }

};

Meteor.publish('getJobs', Job.publications.getJobs);

Meteor.publish('getLatestJob', Job.publications.getLatestJob);
