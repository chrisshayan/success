Template.JobInfo.helpers({
    currentJobTitle: function() {
        return this.job.data.jobtitle;
    }
});
Template.JobInfoItem.helpers({
    title: function() {
        return this.data.jobtitle;
    }
});