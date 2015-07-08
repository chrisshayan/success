Template.jobs.onRendered(function(){
    $('.dataTables').dataTable({
        "dom": 'T<"clear">lfrtip'
    });

});

Template.jobs.helpers({
    jobs: function () {
        return Collections.Jobs.find();
    },
});

Template.jobItem.helpers({

})
