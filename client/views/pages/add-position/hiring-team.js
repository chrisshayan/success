/**
 * Created by HungNguyen on 10/15/15.
 */


Template.hiringTeamTab.onCreated(function () {

});

Template.hiringTeamTab.events({
    'click .remove-criteria': function (e, tmpl) {

    }
});

Template.hiringTeamTab.helpers({
        criteriaSet: function () {
            return [
                {
                    name: 'Skills',
                    value: [1, 2, 3, 4]
                },
                {
                    name: 'Personality traits',
                    value: [1, 2, 3, 4]
                },
                {
                    name: 'Qualification',
                    value: [1, 2, 3, 4]
                },
                {
                    name: 'Details',
                    value: [1, 2, 3, 4]
                }
            ]
        }
    }
);