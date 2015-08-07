Meteor.publish('jobs', function(filters, options) {
    check(filters, Object);
    check(options, Object);
    return Collections.Jobs.find(filters, options);
});