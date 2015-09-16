AutoForm.hooks({
    addCandidateForm: {
        onSubmit: function (doc) {
            var jobId = Utils.transformVNWId(Router.current().params.jobId) || null;
            var currentApplication = Router.current().params.query.application;
            Meteor.call("addCandidate", doc, jobId, function (err, result) {
                if (err) throw err;
                if (result) {
                    AutoForm.resetForm("addCandidateForm");
                    $("#add-candidate-area").removeClass("open");

                    if (!currentApplication) {
                        window.location.reload();
                    }

                    var action = 'Add New Candidate';
                    var info = {
                        category: ['Recruiter', Meteor.userId()].join(':'),
                        label: ['Candidate:', result.candidateId, jobId].join(':')
                    };

                    Utils.trackEvent(action, info);
                }
            });

            return false;
        }
    }
});


JobInfo = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;

        this.page = new ReactiveVar(1);
        this.inc = 5;

        this.job = this.data().job;

        var filters = {
            jobId: {
                $nin: [this.job.jobId]
            },
            source: this.job.source,
            status: this.job.status
        };

        var options = {
            limit: this.limit()
        };

        Template.instance().subscribe('getJobs', filters, options);
    },

    limit: function () {
        return this.page.get() * this.inc;
    },

    fetchOtherJobs: function () {
        var filters = {
            jobId: {
                $nin: [this.job.jobId]
            },
            source: this.job.source,
            status: this.job.status
        };

        if (Meteor.currentRecruiter().showMyJob && Meteor.currentRecruiter().email) {
            filters['recruiterEmails'] = Meteor.currentRecruiter().email;
        }

        var options = {
            limit: this.limit()
        };
        return Collections.Jobs.find(filters, options);
    },

    events: function () {
        return [{}];
    },


    otherJobs: function () {
        return this.fetchOtherJobs();

    }


}).register('JobInfo');


Template.JobInfoItem.helpers({

});


Template.addCandidate.onRendered(function () {
    $('#add-candidate-area .dropdown-menu').click(function (e) {
        e.stopPropagation();
    });
});