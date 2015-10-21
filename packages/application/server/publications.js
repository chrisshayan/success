Publications = {};

Publications.getApplications = function (filters, options) {
    return {

        find: function () {
            if (!this.userId) return this.ready();
            check(filters, Object);
            check(options, Object);

            filters['isDeleted'] = 0;
            if (!options.hasOwnProperty("limit")) {
                options['limit'] = 20;
            } else {
                options['limit'] += 10;
            }
            return Collections.Applications.find(filters, options);
        },
        children: []
    }
};


/**
 * Map to meteor
 */
_.each(Publications, (func, name) =>  Meteor.publishComposite(name, func));