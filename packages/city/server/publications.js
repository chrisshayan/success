Meteor.publish('cities', function () {
    var defaultLanguage = Meteor.settings.defaultLanguage;
    return Meteor.cities.find({languageId: defaultLanguage}, {sort: {order: 1}});
});

