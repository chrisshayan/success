AutoForm.hooks({
    addPosition: {
        onSuccess: function() {
            Router.go("dashboard");
            Notification.success("Added new position");
        }
    }
});