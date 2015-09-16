/**
 * Created by HungNguyen on 8/21/15.
 */


/**
 * Created by HungNguyen on 8/21/15.
 */


var publications = {
    getJobByCompanyId: function (companyId, options) {
        if (companyId == void 0) return [];
        return Collection.find({companyId: companyId}, options || {});
    },

    getJobs: function (filters, options, filterEmailAddress) {
        try {
            if (!this.userId) this.ready();

            check(filters, Object);
            check(options, Match.Optional(Object));

            var DEFAULT_FILTERS = {
                userId: parseInt(this.userId)
            };

            filters = _.extend(DEFAULT_FILTERS, filters);
            options = _.extend(Core.getConfig('job', 'defaultJobOptions'), options);

            if (filterEmailAddress)
                filters['data.emailaddress'] = new RegExp(filterEmailAddress, 'i');


            if (!options.hasOwnProperty("limit")) {
                options['limit'] = 10;
            }
            return Collections.Jobs.find(filters, options);
        } catch (e) {
            debuger(e);
            return this.ready();
        }
    },

    getLatestJob: function () {
        if (!this.userId) return [];

        var userOptions = {
            fields: {
                userId: 1, companyId: 1
            }
        };

        var user = UserApi.methods.getUser(+this.userId, userOptions); //var user = User.model.collection.findOne();

        if (!user) return [];

        var today = new Date(moment().format("YYYY-MM-DD 00:00:00"));
        var filters = {
            companyId: user.companyId,
            'data.expireddate': {
                $gte: today
            }
        };

        var options = Core.getConfig('job', 'defaultJobOptions');
        options['limit'] = 10;
        options['sort'] = {
            createdAt: -1
        };

        return Collection.find(filters, options);
    }

};


/*Meteor.publish('getJobs', publications.getJobs);

 Meteor.publish('getLatestJob', publications.getLatestJob);*/

