/**
 * Created by HungNguyen on 10/15/15.
 */


Template.hiringCriteria.onCreated(function () {
    console.log('jobId : ', this.data);

    var jobId = this.data.jobId;
    var instance = Template.instance();
    instance.criteriaSet = new ReactiveVar([]);

    if (this.data.criteriaId)
        Meteor.subscribe('currentJobCriteria', this.data.criteriaId);
    else
        Meteor.call('getCriteria', jobId, function (err, result) {
            if (err) console.error(err);
            console.log(result);
            //instance.criteriaSet.set(result.category);
            Meteor.subscribe('currentJobCriteria', result._id);

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
            //var instance = Template.instance();
            return Meteor['job_criteria'].find();
        }
    }
);