// Used only on OffCanvas layout

Template.navigation.onCreated(function () {
    var instance = Template.instance();
    instance.company = new ReactiveVar();
    instance.autorun(function () {
        var user = Meteor.user();
        if (user && user.companyId) {
            Meteor.call('getCompanyInfo', user.companyId, function (err, info) {
                if (err) console.error(err);
                else instance.company.set(info);
            });
        }
    })
});

Template.navigation.events({
    'click .close-canvas-menu': function () {
        $('body').toggleClass("mini-navbar");
    }
});

Template.navigation.helpers({
    Avatar() {
        return Avatar;
    },
    displayName: function () {
        var user = Meteor.user();
        if (user && user.profile) {
            var name = [user.profile.firstname, user.profile.lastname].join(' ');
            if(name.trim().length <= 0) {
                return user.defaultEmail();
            }
            return name;
        }
        return '';
    }
});


Template.menuItem.onRendered(function () {
    if (!Router.current().route) return;

    var currentRoute = Router.current().route.getName();
    var route = this.data.route;

    var isActive = currentRoute == route;
    if (this.data.dependencies)
        isActive |= _.contains(this.data.dependencies, currentRoute);

    if (isActive) {
        $(this.firstNode).removeClass("active").addClass("active");
        var ulParent = $(this.firstNode).parent();
        var liParent = ulParent.parent();
        ulParent.removeClass("in").addClass("in");
        liParent.removeClass("active").addClass("active")
    }

});

Template.menuItem.helpers({
    class: function () {
        if (!Router.current().route) return;

        var currentRoute = Router.current().route.getName();
        var route = this.route;
        if (currentRoute == route) {
            return "active";
        }
        return "";
    },

    menuUrl: function () {
        if (!this.route) return "#"
        return Router.url(this.route);
    }

});


Template.menuItem.events({
    'click .menu-item': function (e, tmpl) {
        var target = $(e.currentTarget);

        $(".menu-item").removeClass("active");
        $(".nav-second-level").removeClass("in");
        $(target).addClass("active");

        if (this.childrens && this.childrens.length > 0) {
            $(target).find(".nav-second-level").addClass("in")
        }
    }
});