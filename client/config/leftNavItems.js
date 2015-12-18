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

        if (user) {
            if (user.isCompanyAdmin()) {

                leftNavItems.push({
                    label: "Hiring Team Manage",
                    icon: "fa-users",
                    route: "hiringTeam"
                });

                leftNavItems.push({
                    label: "Mail templates",
                    icon: "fa-envelope-o",
                    route: "mailTemplates"
                });
            }
        }


        leftNavItems.push({
            label: "My account",
            icon: "fa-user",
            route: 'updateProfile'
        });

        leftNavItems.push({
            label: "Logout",
            icon: "fa-sign-out ",
            route: 'logout',
            childrens: []
        });

        return leftNavItems;
    });

});
