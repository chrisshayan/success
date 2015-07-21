Template.jobDetails.rendered = function () {
    $('[data-toggle="tooltip"]').tooltip();
    // Add special class for full height
    $('body').addClass('fixed-sidebar');
    $('body').addClass('full-height-layout');

    // Set the height of the wrapper
    $('#page-wrapper').css("min-height", $(window).height() + "px");

    // Add slimScroll to element
    $('.full-height-scroll').slimscroll({
        height: '100%'
    });

    // Add slimScroll to left navigation
    $('.sidebar-collapse').slimScroll({
        height: '100%',
        railOpacity: 0.9
    });

    /*
     * - Add slide effect and fix issue when slide
     */
    var formContainer = {
        'email': '#email-container',
        'comment': '#comment-container'
    };

    var selectors = {
        details: '.full-height-scroll.white-bg',
        slimScroll: {
            slimClass: '',
            slimScrollClass: '.slimScrollBar'
        }
    };

    Event.on('slideToForm', function (form, isShow) {
        var $details = $(selectors.details);
        var $mailContainer = $(formContainer[form]);

        var height = (isShow) ? $mailContainer.offset().top - $details.offset().top : 0;

        $details.animate({
            scrollTop: height
        }, 'slow', function () {
            $details.siblings(selectors.slimScroll.slimScrollClass)
                .css({'top': height / 2 + 'px'});
        });
    });

};

Template.jobDetails.destroyed = function () {

    // Remove special class for full height
    $('body').removeClass('fixed-sidebar');
    $('body').removeClass('full-height-layout');

    // Destroy slimScroll for left navigation
    $('.sidebar-collapse').slimScroll({
        destroy: true
    });

    // Remove inline style form slimScroll
    $('.sidebar-collapse').removeAttr("style");
};


