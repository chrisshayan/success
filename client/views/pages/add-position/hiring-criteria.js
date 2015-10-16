/**
 * Created by HungNguyen on 10/15/15.
 */


Template.hiringCriteria.onCreated(function () {
    var jobId = 0;
    var instance = Template.instance();
    instance.criteriaSet = new ReactiveVar([]);

    Meteor.call('getCriteria', jobId, function (err, result) {
        if (err) console.error(err);
        console.log(result);
        instance.criteriaSet.set(result);
    });
});

Template.hiringCriteria.events({
    'click .remove-criteria': function (e, tmpl) {
        var $element = $(e.currentTarget);
        var data = $element.data();
        console.log(data);
        var x = this.criteriaSet;
        console.log(x);
    },
    'submit .form-criteria': function (e, tmpl) {
        e.preventDefault();
        var $element = $(e.currentTarget);
        console.log($element.serializeArray())
    }
});

Template.hiringCriteria.helpers({
        criteriaSet: function () {
            var instance = Template.instance();
            return instance.criteriaSet.get();
        }
    }
);