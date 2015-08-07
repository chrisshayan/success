AutoForm.hooks({
    insertJobForm: {
        onSuccess: function() {
            Router.go('jobs');
        }
    }
})