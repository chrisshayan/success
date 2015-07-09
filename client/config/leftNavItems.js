// Run this when the meteor app is started
Meteor.startup(function () {
    leftNavItems = [
        {
            label: "Dashboard",
            icon: "fa-dashboard",
            route: "dashboard",
            childrens: [],
            dependencies: ['jobTrackingBoard']
        },
        {
            label: "Activities",
            icon: "fa-heartbeat",
            route: "activities", childrens: []
        },
        {
            label: "Settings",
            icon: "fa-cogs",
            route: "#",
            childrens: [
                {label: "Company Info", icon: "fa-info", route: "companyInfo"},
                {
                    label: "Mail templates",
                    icon: "fa-envelope-o",
                    route: "mailTemplates",
                    dependencies: ['createMailTemplate', 'updateMailTemplate']
                },
            ]
        }
    ];

    UI.registerHelper('leftNavItems', function () {
        return leftNavItems;
    });
});
