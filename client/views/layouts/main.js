toastr.options = {
    "closeButton": true,
    "debug": false,
    "progressBar": true,
    "positionClass": "toast-bottom-right",
    "onclick": null,
    "showDuration": "200",
    "hideDuration": "4000",
    "preventDuplicates": false,
    "timeOut": "2000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

Template.mainLayout.rendered = function () {

    // Minimalize menu when screen is less than 768px
    $(window).bind("resize load", function () {
        if ($(this).width() < 769) {
            $('body').addClass('body-small')
        } else {
            $('body').removeClass('body-small')
        }
    });

    // Fix height of layout when resize, scroll and load
    $(window).bind("load resize scroll", function () {
        if (!$("body").hasClass('body-small')) {

            //var navbarHeigh = $('nav.navbar-default').height();
            //var wrapperHeigh = $('#page-wrapper').height();

            //if (navbarHeigh > wrapperHeigh) {
            //    $('#page-wrapper').css("min-height", navbarHeigh + "px");
            //}
            //
            //if (navbarHeigh < wrapperHeigh) {
            //    $('#page-wrapper').css("min-height", $(window).height() + "px");
            //}
            //
            //if ($('body').hasClass('fixed-nav')) {
            //    $('#page-wrapper').css("min-height", $(window).height() - 60 + "px");
            //}
        }
    });


    // SKIN OPTIONS
    // Uncomment this if you want to have different skin option:
    // Available skin: (skin-1 or skin-3, skin-2 deprecated)
    // $('body').addClass('skin-1');

    // FIXED-SIDEBAR
    // Uncomment this if you want to have fixed left navigation
    // $('body').addClass('fixed-sidebar');
    // $('.sidebar-collapse').slimScroll({
    //     height: '100%',
    //     railOpacity: 0.9
    // });

    // BOXED LAYOUT
    // Uncomment this if you want to have boxed layout
    // $('body').addClass('boxed-layout');


};


Template.mainLayout.helpers({
    isFinish: function() {
        var user = Meteor.user();
        console.log(user.setupStep)
        return user.setupStep == -1;
    },

    SetupNewAccount: function () {

        return JourneySetup;
    }
});