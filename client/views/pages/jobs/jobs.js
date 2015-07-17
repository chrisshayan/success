Template.jobs.onRendered(function(){
    $('.dataTables').dataTable({
        "dom": 'T<"clear">lfrtip'
    });

});

Template.jobs.helpers({
    publishedJobs: function () {
        var jobs = Collections.Jobs.find();
        return !!jobs.count() ? jobs : [];
    },
    closedJobs: function() {
        return [];
    }
});

Template.jobItem.helpers({
    title: function () {
        return this.data.jobtitle;
    },
    appliedCount: function () {
        return Collections.Applications.find({jobId: this.jobId, stage: 1}).count() || "-";
    },
    phoneScreenCount: function () {
        return Collections.Applications.find({jobId: this.jobId, stage: 2}).count() || "-";
    },
    interviewCount: function () {
        return Collections.Applications.find({jobId: this.jobId, stage: 3}).count() || "-";
    },
    offerCount: function () {
        return Collections.Applications.find({jobId: this.jobId, stage: 4}).count() || "-";
    },
    hiredCount: function () {
        return Collections.Applications.find({jobId: this.jobId, stage: 5}).count() || "-";
    },
    createdTimeago: function() {
        var distance = (new Date() - new Date(this.data.createddate)) / (24 * 60 * 60 * 1000);
        distance = Math.ceil(distance);
        if( distance > 7)
            return moment(this.data.createddate).format('DD MMM YYYY');
        return moment(this.data.createddate).fromNow();
    }
});
