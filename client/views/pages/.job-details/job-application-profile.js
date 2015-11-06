//===================================================================================================================//
// JOB APPLICATION PROFILE
//===================================================================================================================//
JobApplicationProfile = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;
        this.props = new ReactiveDict;
        this.props.setDefault('isLoading', false);
        this.props.setDefault('isViewResume', false);
        this.props.setDefault('isViewFullscreen', false);

        this.defaultToggle = 'More cover letter <i class="fa fa-angle-down"></i>';
        this.coverLetterToggle = new ReactiveVar(this.defaultToggle);

        // Track when current application change
        Template.instance().autorun(function () {
            var params = Router.current().params;
            var applicationId = params.query.application;
            if(applicationId) {
                self.props.set('applicationId', applicationId);

                self.props.set('isLoading', false);
                self.props.set('isViewResume', false);
                self.props.set('isViewFullscreen', false);
                JobDetailsSubs.subscribe('applicationDetails', {application: applicationId});
            }
        });

        this.resumeInfo = new ReactiveVar([]);
    },

    onRendered: function () {
        var self = this;
        // Add slimScroll to element
        $('.full-height-scroll').slimscroll({
            height: '100%'
        });

        Template.instance().autorun(function () {
            var params = Router.current().params;
            self.scrollTop();
        });


    },
    onDestroyed: function () {

    },

    scrollTop: function () {
        var selectors = {
            details: '.full-height-scroll.white-bg',
            slimScroll: {
                slimClass: '',
                slimScrollClass: '.slimScrollBar'
            }
        };
        var $details = $(selectors.details);
        $details.animate({
            scrollTop: 0
        }, 'slow', function () {
            $details.siblings(selectors.slimScroll.slimScrollClass)
                .css({'top': 0 + 'px'});
        });
    },

    events: function () {
        return [{
            'click .more-coverletter': this.toggleCoverLetter,
            'click .view-resume': this.toggleViewResume,
            'click .resume-viewer-fullscreen-mode': this.viewFullscreen,
            'click .resume-viewer-normal-mode': this.exitFullscreen,
            'click .view-resume-online': this.viewResumeOnline
        }];
    },

    /**
     * EVENTS
     */
    toggleCoverLetter: function (e, tmpl) {
        var target = $('.cover-letter p');
        if (target.hasClass("more")) {
            target.removeClass("more");
            this.coverLetterToggle.set('More cover letter <i class="fa fa-angle-down"></i>');
        } else {
            target.addClass("more");
            this.coverLetterToggle.set('Less cover letter <i class="fa fa-angle-up"></i>');
        }
    },

    viewResumeOnline: function (e) {
        e.preventDefault();
        window.open(e.target.href, 'Resume Online', 'width=auto,height=auto');
    },

    toggleViewResume: function () {
        this.props.set('isViewResume', !this.props.get('isViewResume'));
        /*if (this.props.get('isViewResume')) {
         var selectors = {
         details: '.full-height-scroll.white-bg',
         slimScroll: {
         slimClass: '',
         slimScrollClass: '.slimScrollBar'
         }
         };
         var $details = $(selectors.details);
         var $resumeBtnGroup = $('.btn-sm.view-resume');
         var height = $resumeBtnGroup.offset().top - $details.offset().top;
         console.log(height);
         $details.animate({
         scrollTop: height
         }, 'slow', function () {
         $details.siblings(selectors.slimScroll.slimScrollClass)
         .css({'top': height / 2 + 'px'});
         });
         }*/
    },

    viewFullscreen: function () {
        this.props.set('isViewFullscreen', true);
    },

    exitFullscreen: function () {
        this.props.set('isViewFullscreen', false);
        this.props.set('isViewResume', false);
    },

    /**
     * HELPERS
     */


    fullscreenClass: function () {
        return this.props.get('isViewFullscreen') ? " fullscreen " : "";
    },

    resume: function () {
        return this.resumeInfo.get();


    },

    application: function () {
        var self = this;
        var app = Meteor.applications.findOne({_id: this.props.get("applicationId")});
        if (app) {
            this.props.set("candidateId", app.candidateId);

            var resumeId = (app.data) ? app.data.resumeid : null;
            //var results = Collections.Resumes.findOne({resumeId: resumeId});

            resumeId && Meteor.call('getResumeOnlineInfo', resumeId, function (err, results) {
                self.resumeInfo.set(results);
            });
        }


        return app;
    },

    getDegreeName: function (id) {
        var Degrees = Collections.Degrees.findOne({id: id});

        return (Degrees) ? Degrees.highestDegreeName : '';

    },

    isString: function (input) {
        return (typeof input === 'object');
    },

    candidate: function () {
        if (!this.props.get('candidateId')) return {};
        return Meteor.candidates.findOne({candidateId: this.props.get('candidateId')});
    }
}).register('JobApplicationProfile');
