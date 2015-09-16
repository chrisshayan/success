Template.jobTagsInput.onRendered(function() {
    var self = this;
    var instance = Template.instance();
    self.jobId = instance.data.jobId;
    var updateTags = function (tags) {
        Meteor.call('updateJobTags', self.jobId, tags);
    }
    var jobTags = instance.find(".job-tags");

    $(jobTags).tagsinput({
        tagClass: this.data.tagClass || "label label-default",
        maxTags: 5,
        typeaheadjs: {
            displayKey: 'skillName',
            valueKey: 'skillName',
            source: function (q, sync, async) {
                self.searchId && Meteor.clearTimeout(self.searchId);
                self.searchId = Meteor.setTimeout(function () {
                    Meteor.call("searchSkill", q, function (err, result) {
                        if (err) throw err;
                        result = _.sortByOrder(result, ['char', 'asc']);
                        async(result)
                    });
                }, 500);
            }
        },
        freeInput: true
    });

    $(jobTags).on('itemAdded', function (event) {
        updateTags($(this).tagsinput('items'))
        event.preventDefault();
    });
    $(jobTags).on('itemRemoved', function (event) {
        updateTags($(this).tagsinput('items'))
        event.preventDefault();
    });
});

Template.jobTagsInput.helpers({
    tags: function() {
        var job = Collections.Jobs.findOne({jobId: this.jobId});
        return job && job.tags ? job.tags : [];
    },
    hint: function() {
        var job = Collections.Jobs.findOne({jobId: this.jobId});
        if (job.tags && job.tags.length > 0) return "";
        return "click to add labels to your job";
    }
});