/**
 * Created by HungNguyen on 8/21/15.
 */


Job.publications = {
    getJobByCompanyId: function (companyId, options) {
        if (companyId == void 0) return [];
        return Collection.find({companyId: companyId}, options || {});
    },

    getJobs: function (filters, options, filterEmailAddress) {
        try {
            if (!this.userId) this.ready();

            /*check(filters, Object);
             check(options, Match.Optional(Object));*/

            var DEFAULT_FILTERS = {
                userId: parseInt(this.userId)
            };

            filters = _.assign(DEFAULT_FILTERS, filters);
            options = _.assign(CONFIG.defaultJobOptions, options);

            if (filterEmailAddress)
                filters['jobEmailTo'] = new RegExp(filterEmailAddress, 'i');


            if (!options.hasOwnProperty("limit")) {
                options['limit'] = 10;
            }

            return Collection.find(filters, options);
        } catch (e) {
            debuger(e);
            return this.ready();
        }
    },

    getLatestJob: function () {
        if (!this.userId) return [];
        var query = {
            userId: +this.userId
        };

        var options = {
            fields: {
                userId: 1, companyId: 1
            }
        };

        var user = User.methods.findOne(query, options); //var user = User.model.collection.findOne();

        if (!user) return [];

        var today = new Date(moment().format("YYYY-MM-DD 00:00:00"));
        var filters = {
            companyId: user.companyId,
            'data.expireddate': {
                $gte: today
            }
        };

        var options = CONFIG.defaultJobOptions;
        options['limit'] = 10;
        options['sort'] = {
            createdAt: -1
        };

        return Collection.find(filters, options);
    }

};