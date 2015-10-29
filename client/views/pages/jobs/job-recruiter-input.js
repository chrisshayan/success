Template.jobRecruiterInput.onRendered(function() {
    var self = this;
    var instance = Template.instance();
    self.jobId = instance.data.jobId;
    var jobRecruiter = instance.find(".job-recruiter-input");

    $(jobRecruiter).tagsinput({
        tagClass: this.tagClass || "tag label label-info"
    });
});

Template.jobRecruiterInput.helpers({
    emails: function() {
        //var job = Collections.Jobs.findOne({_id: this.jobId});
        var job = Meteor['jobs'].findOne({_id: this.jobId});
        return job && job.recruiterEmails ? job.recruiterEmails : [];
    }
});