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

});
