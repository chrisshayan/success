AutoForm.hooks({
    addJob: {
        onSuccess: function () {
            $('.criteria-tab').trigger('click');
            Notification.success("Job's created!");
        },
        onFailure: function (e) {
            console.log(e);
        }
    },
    updateJobs: {
        onSuccess: function (type, result) {
            if (result)
                Notification.success("Job's updated!");
        },
        onFailure: function (e) {
            console.log(e);
        }
    }
});


Template.AddJob.onCreated(function () {
    var instance = Template.instance();
    instance.jobId = new ReactiveVar();
    var params = Router.current().params;
    console.log(params.jobId);
    (params.jobId) && instance.jobId.set(params.jobId);
});


Template.AddJob.helpers({
    /*jobId: function () {
        var instance = Template.instance();
        console.log('id', instance.jobId.get());
        return instance.jobId.get();
    }*/
});

Template.AddJob.events({
    'click li': function (e, tmpl) {
        var $element = $(e.currentTarget);
        if ($element.hasClass('active')) {
            e.stopPropagation();
            return false;
        }
        /*$('#addJob').trigger('submit');*/
        console.log('tab clicked');

    }
});