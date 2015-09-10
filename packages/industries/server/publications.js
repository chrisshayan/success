Meteor.publish('industries', function () {
    var defaultLanguage = Meteor.settings.defaultLanguage;
    return Meteor.industries.find({languageId: defaultLanguage}, {sort: {order: 1}});
});