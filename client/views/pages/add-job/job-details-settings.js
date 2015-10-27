/**
 * Created by HungNguyen on 10/22/15.
 */

/*

 Template.jobDetailSettings.onCreated({

 });

 */

Template.jobDetailSettings.helpers({
    formatParagraph: function (text) {
        return text.replace(/\n/g, '<br/>');
    },

    locations: function() {
        var cities = Meteor.cities.find({_id: {$in: this.locations}}).fetch();
        return _.pluck(cities, 'name')
    }
});
