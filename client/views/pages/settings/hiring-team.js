/**
 * Created by HungNguyen on 10/7/15.
 */


Template.hiringTeam.onCreated(function () {
    var instance = Template.instance();
    instance.props = new ReactiveDict();
    instance.props.set('limit', 10);
    var data = this.data;

    this.autorun(function () {
        var option = {
            limit: this.limit
        };
        console.log('data.companyId ', data);
        Meteor.subscribe('hiringTeamList', data.companyInfo.companyId, option);
    })
});

Template.hiringTeam.helpers({
    data: function () {
        return Meteor['hiringTeam'].find({}).fetch();
    }
});


Template.hiringTeam.onRendered(function () {

});

Template.hiringTeam.events({
    'submit #send-request': function (e) {
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


    }
});

Template.memberInfo.helpers({
    formatDate: function (date) {

        return moment(date).format('hh:mm A, DD-MM-YYYY');
    },
    formatStatus: function (status) {
        if (status == void 0) return 'unknown';

        switch (status) {
            case 1 :
                return 'confirmed';
            case 0 :
            default :
                return 'pending';

        }
    }
});