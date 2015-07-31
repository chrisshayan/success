// Used only on OffCanvas layout

Template.navigation.onCreated(function () {
    var self = this;
    if(!Meteor.user()) return;
    this.company = new ReactiveVar();
    var companyId = Meteor.user().companyid;
    Meteor.call('getCompanyInfo', companyId, function (err, info) {
        if (err) console.error(err);
        else self.company.set(info);
    });
});

Template.navigation.events({
    'click .close-canvas-menu': function () {
        $('body').toggleClass("mini-navbar");
    }
});

Template.navigation.helpers({
    company_logo: function () {
        var company = Template.instance().company.get();
        if (company)
            return company.logo;

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

    menuUrl: function() {
        if(!this.route) return "#"
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