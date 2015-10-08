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
            label: "Settings",
            icon: "fa-cogs",
            route: null,
            childrens: [
                {label: "Company Info", icon: "fa-info", route: "companyInfo"},
                {
                    label: "Mail templates",
                    icon: "fa-envelope-o",
                    route: "mailTemplates",
                    dependencies: ['createMailTemplate', 'updateMailTemplate']
                },
                {label: "Mail Signature", icon: "fa-at", route: "mailSignature"},
                {label: "Hiring Team Manage", icon: "fa-users", route: "hiringTeam"}
            ]
        }
    ];

    UI.registerHelper('leftNavItems', function () {
        return leftNavItems;
    });
});
