AutoForm.hooks({
    addCandidateForm: {
        onSubmit: function (doc) {
            var jobId = Router.current().params.jobId || null;
            var currentApplication = Router.current().params.query.application;
            if (jobId) jobId = +jobId;
            Meteor.call("addCandidate", doc, jobId, function (err, result) {
                if (err) throw err;
                if (result) {
                    AutoForm.resetForm("addCandidateForm");
                    $("#add-candidate-area").removeClass("open");

                    if (!currentApplication) {
                        window.location.reload();
                    }
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

        Template.instance().subscribe('jobs', {
            status: this.job.status,
            limit: this.limit(),
            except: [this.job.jobId]
        });
    },

    limit: function () {
        return this.page.get() * this.inc;
    },

    fetchOtherJobs: function () {
        var filters = {
            jobId: {
                $nin: [this.job.jobId]
            }
        };
        var today = new Date(moment().format("YYYY-MM-DD 00:00:00"));
        if (this.job.status == 1) {
            filters['data.expireddate'] = {
                $gte: today
            }
        } else {
            filters['data.expireddate'] = {
                $lt: today
            }
        }

        if (Meteor.currentRecruiter().showMyJob && Meteor.currentRecruiter().email) {
            filters['data.emailaddress'] = new RegExp(Meteor.currentRecruiter().email, "i");
        }

        var options = {
            limit: this.limit()
        };
        return Collections.Jobs.find(filters, options);
    },

    events: function () {
        return [{}];
    },

    currentJobTitle: function () {
        return this.job.data.jobtitle;
    },

    otherJobs: function () {
        return this.fetchOtherJobs();

    }


}).register('JobInfo');


Template.JobInfoItem.helpers({
    title: function () {
        return this.data.jobtitle;
    }
});


Template.addCandidate.onRendered(function () {
    $('#add-candidate-area .dropdown-menu').click(function (e) {
        e.stopPropagation();
    });
});