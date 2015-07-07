var defaultQueryOptions = {
    limit: 10
};

Meteor.methods({

    jobs: function(options) {
        //this.unblock();
        //options = _.defaults(defaultQueryOptions, options);
        //
        //var _func = Meteor.wrapAsync(APIS.jobs);
        //return _func(options);
        return [];
    },

    jobApplications: function(options) {
        //this.unblock();
        //options = _.defaults(defaultQueryOptions, options);
        //
        //var _func = Meteor.wrapAsync(APIS.jobApplications);
        //return _func(options);
        return [];
    },

});