/**
 * Created by HungNguyen on 8/21/15.
 */


Application.publications = {
    getApplications: function (filters, options) {
        if (!this.userId) return this.ready();
        /*check(filters, Object);
         check(options, Object);*/
        var user = UserApi.methods.getUser(this.userId);
        if (!user) return;

        filters['companyId'] = user.companyId;

        options = _.extend(CONFIG.defaultActivitiesOptions, filters);
        if (!options.hasOwnProperty("limit")) {
            options['limit'] = 20;
        }
        return Collections.Applications.find(filters, options);
    }
};