Meteor.publishComposite('getApplications', function (jobId, filters, options) {
    return {

        find: function () {
            if (!this.userId) return this.ready();
            check(filters, Object);
            check(options, Object);

            filters['isDeleted'] = 0;

            options = _.defaults(options, DEFAULT_APPLICATION_OPTIONS);
            if (!options.hasOwnProperty("limit")) {
                options['limit'] = 20;
            } else {
                options['limit'] += 10;
            }
            return Collections.Applications.find(filters, options);
        },
        children: [
            //{
            //    find: function (application) {
            //        var cond = {
            //            candidateId: application.candidateId
            //        };
            //        var options = DEFAULT_CANDIDATE_OPTIONS;
            //        options.limit = 1;
            //        return Collections.Candidates.find(cond, options)
            //    }
            //}
        ]
    }
});