// Run this when the meteor app is started
Meteor.startup(function () {
    return SEO.config({
        title: 'Success - Application Tracking System',
        meta: {
            'description': 'Vietnamworks Success - Application Tracking System'
        },
        og: {
            title: 'Vietnamworks Success - Application Tracking System',
            image: 'Vietnamworks Success - Application Tracking System'
        }
    });
});
