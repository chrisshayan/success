Template.mailSignature.onRendered(function() {
    $("#mail-signature-editor").summernote();
});

Template.mailSignature.events({
    'submit #mail-signature-form': function() {
        var signature = $("#mail-signature-editor");
        if(!_.isEmpty(signature.code())) {
            Meteor.call("updateMailSignature", signature.code(), function(err, result) {
                if(err) throw err;
                if(result) {
                    Notification.success("Update mail signature successful!");
                } else {
                    Notification.error("Update mail signature unsuccessful!");
                }
            });
        }
        return false;
    }
});

Template.mailSignature.helpers({
    MailSignatureEditor: function() {
        return MailSignatureEditor;
    }
});
