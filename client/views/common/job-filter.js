Template.jobFilter.helpers({
    settings: function () {
        return {
            position: 'below',
            limit: 10,
            rules: [{
                collection: 'vnw_skills',
                subscription: 'searchSkillAutocomplete',
                field: 'skillName',
                options: 'i',
                matchAll: false,
                template: Template.jobFilterItem
            }]
        }
    },

    currentFilter: function () {
        return Session.get('jobFilterTags') || [];
    }
});

Template.jobFilter.events({
    'keydown #job-filter': function (e, tmpl) {
        if(e.which == 13 || e.which == 188) {
            var tag = e.target.value.trim().toLowerCase();
            if (tag.length > 0) {
                e.preventDefault();
                var tags = Session.get('jobFilterTags') || [];
                tags.push(tag);
                Session.set('jobFilterTags', _.unique(tags));
                e.target.value = '';
                e.target.focus();
            }
        }
    },

    'autocompleteselect #job-filter': function (e, template, doc) {
        e.preventDefault();
        var tags = Session.get('jobFilterTags') || [];
        tags.push(doc.skillName);
        Session.set('jobFilterTags', _.unique(tags));
        e.target.value = '';
        e.target.focus();
    }
})

Template.jobTagFilter.events({
    'click .tag-close': function (e) {
        e.preventDefault();
        var tags = Session.get('jobFilterTags') || [];
        tags = _.without(tags, this.value);
        Session.set('jobFilterTags', _.unique(tags));
    }
})
