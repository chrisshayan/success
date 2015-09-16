Template.jobDetails.onCreated(function () {
    Template.instance().autorun(function () {
        var params = Router.current().params;
        var jobId = params.jobId;
        var stage = _.findWhere(Success.APPLICATION_STAGES, {alias: params.stage});
        Session.set("currentJobId", jobId);
        Session.set("currentStage", stage);
        if (params.query.hasOwnProperty('application')) {
            applicationId = params.query.application;
            if (_.isNumber(applicationId))
                applicationId = parseInt(applicationId);
            Session.set("currentApplicationId", applicationId);
        }
    });
});

Template.jobDetails.onRendered(function () {
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
})
;

Template.jobDetails.onDestroyed(function () {
    var jobDetailsSessions = [
        "currentApplicationId",
        "currentApplication",
        "currentJob",
        "currentCandidate",
        "currentJobId",
        "currentStage"
    ];
    _.each(jobDetailsSessions, function (session) {
        delete Session.keys[session];
    });


    // Remove special class for full height
    $('body').removeClass('fixed-sidebar');
    $('body').removeClass('full-height-layout');

    // Destroy slimScroll for left navigation
    $('.sidebar-collapse').slimScroll({
        destroy: true
    });

    // Remove inline style form slimScroll
    $('.sidebar-collapse').removeAttr("style");
});

Template.jobDetails.helpers({
    JobCandidatesContainer: function () {
        return JobCandidatesContainer;
    }
});