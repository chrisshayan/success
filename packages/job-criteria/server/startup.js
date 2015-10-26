Meteor.startup(function () {
    var defaultTemplates = [
        {
            name: 'Skills',
            hint: 'html, php, leadership, etc',
            description: ''
        },
        {
            name: 'Personality traits',
            hint: 'ambitious, Cooperative, etc',
            description: ''
        },
        {
            name: 'Qualification',
            hint: 'education, leadership, etc',
            description: ''
        },
        {
            name: 'Details',
            hint: 'flexible, cooperative, etc',
            description: ''
        }
    ];
    var hasTemplates = Meteor.job_criteria_set_templates.find({companyId: {$exists: false}}).count();
    if (hasTemplates < 4) {
        Meteor.job_criteria_set_templates.remove({companyId: {$exists: false}});
        _.each(defaultTemplates, function(tmpl) {
             new JobCriteriaSetTemplate(tmpl).save();
        });
    }
});