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
        var settingMenu = [];

        if(user) {
            settingMenu.push({label: "Mail Signature", icon: "fa-at", route: "mailSignature"});
            if(user.isCompanyAdmin()) {
                settingMenu.push({label: "Company Info", icon: "fa-info", route: "companyInfo"});
                settingMenu.push({
                    label: "Mail templates",
                    icon: "fa-envelope-o",
                    route: "mailTemplates",
                    dependencies: ['createMailTemplate', 'updateMailTemplate']
                });
                settingMenu.push({label: "Hiring Team Manage", icon: "fa-users", route: "hiringTeam"});
            }

        }
        leftNavItems.push({
            label: "Settings",
            icon: "fa-cogs",
            route: null,
            childrens: settingMenu
        });
        return leftNavItems;
    });
    
});
