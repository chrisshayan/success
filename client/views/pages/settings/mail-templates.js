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


Template.mailTemplate.events({

    'click .remove': function (e, tmpl) {
        var self = this;
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this template!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, function () {
            Meteor.call('deleteMailTemplate', self._id, function(err, result){
                if(err) throw err;
                swal("Deleted!", "Your mail template has been deleted.", "success");
            });

        });
    }

});
