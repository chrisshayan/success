/**
 * Created by HungNguyen on 8/21/15.
 */


var publications = {
    getApplications: function (filters, options) {
        if (!this.userId) return this.ready();
        /*check(filters, Object);
         check(options, Object);*/
        var user = Meteor.call('getUser', this.userId);
        if (!user) return;

        filters['companyId'] = user.companyId;

        options = _.extend(Core.getConfig('application', 'defaultActivitiesOptions'), filters);

        if (!options.hasOwnProperty("limit")) {
            options['limit'] = 20;
        }
        return Collection.find(filters, options);
    }
};

Meteor.publish('getApplications', publications.getApplications);