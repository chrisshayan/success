Template.mailTemplates.onRendered(function() {
    // Initialize dataTables
    $('.dataTables').dataTable({
        "dom": 'T<"clear">lfrtip'
    });

});

Template.mailTemplates.helpers({

    data: function() {
        return Collections.MailTemplates.find();
    }

});