Notification = {
    push: function(type, content) {
        check(type, String);
        check(content, String);
        type = type.toLowerCase();
        check(type, Match.OneOf("info", "success", "error", "warning"));

        toastr[type](content);
    },
    success: function(content) {
        this.push('success', content);
    },
    info: function(content) {
        this.push('info', content);
    },
    warning: function(content) {
        this.push('warning', content);
    },
    error: function(content) {
        this.push('error', content);
    }
};

