/**
 * Created by HungNguyen on 10/7/15.
 */


Template.hiringTeam.events({
    'change input[name="request-email"]': function (e, tmpl) {
        var $inputField = $(tmpl.find('input[name="request-email"]'));
        var $helpBlock = $(tmpl.find('.help-block'));

        if ($inputField.val() !== '') {
            $inputField.parent('div').toggleClass('has-error', false);
            $helpBlock.text('');
        }
    },
    'submit #send-request': function (e, tmpl) {
        var self = this;
        e.preventDefault();
        var obj = {};

        var $inputField = $(tmpl.find('[name="request-email"]'));
        var $helpBlock = $(tmpl.find('.help-block'));
        $.each($('#send-request').serializeArray(), function (index, value) {
            obj[value.name] = value.value.trim();
        });

        if (obj['request-email'] === '') {
            $inputField.parent('div').toggleClass('has-error', true);
            $helpBlock.text('Please enter email address to send invitation');
            return false;
        }


        obj['companyId'] = (self.companyInfo) ? self.companyInfo.companyId : 0;
        obj['fromEmailAddress'] = Meteor.user().username || Meteor.user().email1 || Meteor.user().email2 || null;

        Meteor.call('sendRequest', obj, function (err, result) {
            $inputField.parent('div').toggleClass('has-error', result.status === 0);

            if (result.status === 0) {
                $helpBlock.text(result.message);
            } else {
                $helpBlock.text('');
                $inputField.val('');
            }
        });

    }
});


Template.hiringTeamActionsCell.events({
    'click .remove': function (e) {
        e.preventDefault();
        Meteor.call('removeHiringTeamRequest', this._id);
    }
});

Template.hiringTeamActionsCell.helpers({
    isOwner: function () {
        return (this.roleId === 'admin');
    }
});
