// Run this when the meteor app is started
Meteor.startup(function () {


    UI.registerHelper('leftNavItems', function () {
        var leftNavItems = [
            {
                label: "Dashboard",
                icon: "fa-dashboard",
                route: "dashboard",
                childrens: [],
                dependencies: ['jobTrackingBoard']
            }
        ];

        var user = Meteor.user();

        if(user && user.isCompanyAdmin()) {
            leftNavItems.push({
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
            });
        }
        return leftNavItems;
    });
    
});
