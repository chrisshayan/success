/**
 * Created by HungNguyen on 10/15/15.
 */


Template.hiringCriteria.onCreated(function () {
    console.log('jobId : ', this.data);

    var jobId = this.data.jobId;
    var instance = Template.instance();
    instance.criteriaId = new ReactiveVar([]);
    var self = this;
    instance.autorun(function () {
        if (self.data.criteriaId) {
            instance.criteriaId.set(self.data.criteriaId);
            Meteor.subscribe('currentJobCriteria', self.data.criteriaId);
        }
        else
            Meteor.call('getCriteria', jobId, function (err, result) {
                if (err) console.error(err);
                //console.log(result);
                //instance.criteriaSet.set(result.category);
                instance.criteriaId.set(result._id);
                Meteor.subscribe('currentJobCriteria', result._id);

            });
    });

});

Template.hiringCriteria.events({
    'click .remove-criteria': function (e, tmpl) {
        var $element = $(e.currentTarget);
        var data = $element.data();
        //console.log(data);
        var instance = Template.instance();
        var _cId = instance.criteriaId.get();

        Meteor.call('changeCriteriaInSet', _cId, data['categoryName'], data['criteriaValue'], true, function (err, result) {
            if (err) console.error(err);
            if (!result) {
                console.log('action failed');
            }
        })

    },
    'submit .form-criteria': function (e, tmpl) {
        e.preventDefault();
        var $element = $(e.currentTarget);
        var params = {};

        $.each($element.serializeArray(), function (index, value) {
            params[value.name] = value.value.trim();
        });

        var instance = Template.instance();
        var _cId = instance.criteriaId.get();

        Meteor.call('changeCriteriaInSet', _cId, params.catName, params.criteriaName, function (err, result) {
            if (err) console.error(err);
            if (!result) {
                console.log('action failed');
            }
        })

    }
});

Template.hiringCriteria.helpers({
        criteriaSet: function () {
            var instance = Template.instance();
            var _cId = instance.criteriaId.get();
            var jc = Meteor['job_criteria'].findOne({_id: _cId});

            return (jc) ? jc.category : [];
        }
    }
);