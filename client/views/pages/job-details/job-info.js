AutoForm.hooks({
    addCandidateForm: {
        onSubmit: function (doc) {
            var params = Router.current().params;
            var jobId = params._id;
            var currentApplication = params.query.application;
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
        var instance = Template.instance();

        this.page = new ReactiveVar(1);
        this.inc = 5;

        instance.autorun(function() {
            var params = Router.current().params;
            self.jobId = params._id;
            //var job = Collections.Jobs.findOne({_id: self.jobId});
            var job = Meteor['jobs'].findOne({_id: self.jobId});
            self.job = job;
            if(self.job) {
                self.stage = _.findWhere(Success.APPLICATION_STAGES, {alias: params.stage});
                instance.subscribe('getJobs', self.filter(), self.option());
            }
        });
    },

    filter() {
        return {
            _id: {$ne: this.jobId},
            source: this.job.source.type,
            status: this.job.status
        }
    },

    option() {
        return {
            limit: this.page.get() * this.inc
        }
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

        //return Collections.Jobs.find(this.filter(), this.option());
        return Meteor['jobs'].find(this.filter(), this.option());
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