/**
 * Created by HungNguyen on 10/7/15.
 */


Template.hiringTeam.events({
    'submit #send-request': function (e, tmpl) {
        var self = this;
        e.preventDefault();
        var obj = {};
        $.each($('#send-request').serializeArray(), function (index, value) {
            obj[value.name] = value.value;
        });

        obj['companyId'] = (self.companyInfo) ? self.companyInfo.companyId : 0;
        obj['fromEmailAddress'] = Meteor.user().username || Meteor.user().email1 || Meteor.user().email2 || null;

        Meteor.call('sendRequest', obj, function (err, result) {

            if (result) {
                console.log(result);
            }
        });
        tmpl.find('[name="request-email"]').value = '';
    }
});


Template.hiringTeamActionsCell.events({
    'click .remove': function(e) {
        e.preventDefault();
        Meteor.call('removeHiringTeamRequest', this._id);
    }
});
