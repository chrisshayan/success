Template.createMailTemplate.onRendered(function () {
    $('.summernote').summernote();
    // Reset error
    AutoForm.resetForm('mailTemplateForm');
});
Template.createMailTemplate.helpers({
    type: function () {
        if (this.doc)
            return "update";
        return "insert";
    },
    isNew: function() {
        return !this.doc;
    },
    isSystem: function() {
        return this.doc && this.doc.type == 1;
    }
});

AutoForm.hooks({
    mailTemplateForm: {
        onSuccess: function () {
            Router.go('mailTemplates');
        }
    }
});