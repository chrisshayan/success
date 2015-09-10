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

            check(filters, Object);
            check(options, Match.Optional(Object));


            filters = _.pick(filters, 'status');
            options = _.pick(options, 'limit', 'sort');

            if (filterEmailAddress)
                filters['data.emailaddress'] = new RegExp(filterEmailAddress, 'i');


            if (!options.hasOwnProperty("limit")) {
                options['limit'] = 5;
            } else {
                options['limit'] += 5;
            }
            return Collection.find(filters, options);
        } catch (e) {
            console.log('Publish getJobs: ',e);
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

        var options = CONFIG.defaultJobOptions;
        options['limit'] = 10;
        options['sort'] = {
            createdAt: -1
        };

        return Collection.find(filters, options);
    },

    addPosition: function() {
        var cursors = [];
        var jobLevels = Meteor.job_levels.find();
        var industries = Meteor.industries.find();
        var cities = Meteor.cities.find();

        cursors.push(jobLevels);
        cursors.push(industries);
        cursors.push(cities);
        return cursors;
    }

};

Meteor.publish('getJobs', Job.publications.getJobs);

//Meteor.publish('getLatestJob', Job.publications.getLatestJob);

Meteor.publish('addPosition', Job.publications.addPosition);