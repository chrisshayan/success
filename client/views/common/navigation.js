// Used only on OffCanvas layout
Template.navigation.events({

    'click .close-canvas-menu' : function(){
        $('body').toggleClass("mini-navbar");
    }

});

Template.menuItem.onRendered(function() {
    if(!Router.current().route) return;

    var currentRoute = Router.current().route.getName();
    var route = this.data.route;

    var isActive = currentRoute == route;
    if( this.data.dependencies )
        isActive |= _.contains(this.data.dependencies, currentRoute);

    if( isActive ) {
        $(this.firstNode).removeClass("active").addClass("active");
        var ulParent = $(this.firstNode).parent();
        var liParent = ulParent.parent();
        ulParent.removeClass("in").addClass("in")
        liParent.removeClass("active").addClass("active")
    }

});

Template.menuItem.helpers({
    class: function() {
        if(!Router.current().route) return;

        var currentRoute = Router.current().route.getName();
        var route = this.route;
        if( currentRoute == route ) {
            return "active";
        }
        return "";
    }
})


Template.menuItem.events({
   'click .menu-item': function(e, tmpl) {
       var target = $(e.currentTarget);

       $(".menu-item").removeClass("active");
       $(".nav-second-level").removeClass("in");
       $(target).addClass("active");

       if( this.childrens && this.childrens.length > 0 ) {
           $(target).find(".nav-second-level").addClass("in")
       }
   }
});