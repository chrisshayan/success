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
            var jobId = parseInt(params.jobId);
            var stage = _.findWhere(Recruit.APPLICATION_STAGES, {alias: params.stage});
            var applicationId = parseInt(params.query.application);
            self.props.set('applicationId', applicationId);
            
            self.props.set('isLoading', false);
            self.props.set('isViewResume', false);
            self.props.set('isViewFullscreen', false);

            var application = Collections.Applications.findOne({entryId: applicationId});
            self.props.set('application', application);

            if(application) {
                var candidate = Collections.Candidates.findOne({candidateId: application.candidateId});
                self.props.set('candidate', candidate);
            }
        });

        // Bind empty event
        this.onEmptyProfile = function () {
            self.props.set('application', null);
            self.props.set('candidate', null);
        };
        Event.on('emptyProfile', this.onEmptyProfile);
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
        Event.removeListener('emptyProfile', this.onEmptyProfile);
    },

    scrollTop: function() {
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

    toggleViewResume: function() {
        this.props.set('isViewResume', !this.props.get('isViewResume'));
    },

    viewFullscreen: function() {
        this.props.set('isViewFullscreen', true);
    },

    exitFullscreen: function() {
        this.props.set('isViewFullscreen', false);
        this.props.set('isViewResume', false);
    },

    /**
     * HELPERS
     */

    /**
     * get candidate fullname
     * @returns {string}
     */
    fullname: function () {
        var can = this.props.get('candidate');
        if (!can) return "";
        return can.data.lastname + " " + can.data.firstname;
    },

    /**
     * get candidate job title
     * @returns {String}
     */
    jobTitle: function () {
        var can = this.props.get('candidate');
        if (!can) return "";
        return can.data.jobtitle;
    },

    /**
     * Cover letter
     */
    coverLetter: function () {
        var app = this.props.get('application');
        if (!app)
            return "";
        var nl2br = function (str, is_xhtml) {
            var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

            return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
        };
        return nl2br(app.data.coverletter);
    },

    /**
     * get candidate city location
     * @returns {String}
     */
    city: function () {
        var can = this.props.get('candidate');
        if (!can) return "";
        return can.data.city;
    },

    /**
     * Get candidate phone: cellphone or homephone
     * @returns {String}
     */
    phone: function () {
        var can = this.props.get('candidate');
        if (!can) return "";
        return can.data.cellphone || can.data.homephone || "";
    },

    profileUrl: function () {
        var app = this.props.get("application");
        if(!app) return "";
        var queryParams = "";
        if(app.source == 1) {
            queryParams = "?jobid=%s&appid=%s";
        } else {
            queryParams = "?jobid=%s&sdid=%s";
        }

        var url = Meteor.settings.public.applicationUrl;
        return url + sprintf(queryParams, app.jobId, app.entryId);
    },

    isDisqualified: function() {
        return this.props.get('application').disqualified;
    },

    matchingScore: function() {
        return this.props.get('application').matchingScore;
    },

    isSentDirectly: function() {
        return this.props.get('application').source === 2;
    },
    applicationId: function() {
        return this.props.get("application").entryId;
    },

    resumeFileUrl: function() {
        var data = this.props.get('application');
        var link = "downloadresume/" + data.companyId + "/" + data.entryId;
        return Meteor.absoluteUrl(link);
    },
    fullscreenClass: function() {
        return this.props.get('isViewFullscreen') ? " fullscreen " : "";
    }

}).register('JobApplicationProfile');