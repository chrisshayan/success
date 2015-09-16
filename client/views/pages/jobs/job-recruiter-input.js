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
        var job = Collections.Jobs.findOne({jobId: this.jobId});
        return job && job.recruiterEmails ? job.recruiterEmails : [];
    }
});