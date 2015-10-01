Template.jobTagsInput.helpers({
    tags: function () {
        var job = Collections.Jobs.findOne({jobId: this.jobId});
        return job && job.tags ? job.tags : [];
    },
    hint: function () {
        var job = Collections.Jobs.findOne({jobId: this.jobId});
        if (job.tags && job.tags.length > 0) return "";
        return "click to add labels to your job";
    },

    settings: function () {
        return {
            position: "top",
            limit: 5,
            rules: [
                {
                    collection: 'vnw_skills',
                    field: "skillName",
                    options: 'i',
                    matchAll: false,
                    subscription: 'searchSkillAutocomplete',
                    template: Template.jobFilterItem
                }
            ]
        };
    }
});


Template.jobTagsInput.events({
    'keydown .tag-input': function(e) {
        if(e.which == 13 || e.which == 188) {
            var tag = e.target.value.trim().toLowerCase();
            if(tag.length > 0) {
                var job = Collections.Jobs.findOne({jobId: this.jobId});
                if (job) {
                    e.preventDefault();
                    var tags = job.tags || [];
                    tags.push(tag);
                    Meteor.call('updateJobTags', this.jobId, _.unique(tags));
                    e.target.value = '';
                    e.target.focus();
                }
            }
        }
    },


    'autocompleteselect .tag-input': function (e, template, doc) {
        e.preventDefault();
        var job = Collections.Jobs.findOne({jobId: this.jobId});
        if (job) {
            e.preventDefault();
            var tags = job.tags || [];
            tags.push(doc.skillName);
            Meteor.call('updateJobTags', this.jobId, _.unique(tags));
            e.target.value = '';
            e.target.focus();
        }
    }
});
Template.jobTagItem.events({
    'click .tag-close': function (e, tmpl) {
        e.preventDefault();
        var job = Collections.Jobs.findOne({jobId: this.jobId});
        if (job) {
            var tags = job.tags || [];
            tags = _.without(tags, this.value);
            Meteor.call('updateJobTags', this.jobId, tags);
        }
    }
})