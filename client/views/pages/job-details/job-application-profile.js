//===================================================================================================================//
// JOB APPLICATION PROFILE
//===================================================================================================================//
JobApplicationProfile = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;
        this.isLoading = new ReactiveVar(false);
        this.applicationId = new ReactiveVar(null);
        this.application = new ReactiveVar(null);
        this.candidate = new ReactiveVar(null);
        this.lastApplicaton = null;
        this.defaultToggle = 'More cover letter <i class="fa fa-angle-down"></i>';
        this.coverLetterToggle = new ReactiveVar(this.defaultToggle);

        // Track when current application change
        Template.instance().autorun(function () {
            var query = Router.current().params.query;
            if (query.hasOwnProperty('application')) {
                var applicationId = parseInt(query.application);
                self.isLoading.set(true);
                self.applicationId.set(applicationId);
                Meteor.call('getApplicationDetails', applicationId, function (err, result) {
                    if (err) throw err;
                    self.isLoading.set(false);
                    self.application.set(result.application);
                    self.candidate.set(result.candidate);
                    self.coverLetterToggle.set(self.defaultToggle);
                    $('.cover-letter p').removeClass("more");
                });
            } else {
                self.application.set(null);
                self.candidate.set(null);
                self.coverLetterToggle.set(self.defaultToggle);
                $('.cover-letter p').removeClass("more");
            }
        });

        // Bind empty event
        Event.on('emptyProfile', function () {
            self.application.set(null);
            self.candidate.set(null);
        });
    },

    onRendered: function () {
        // Add slimScroll to element
        $('.full-height-scroll').slimscroll({
            height: '100%'
        })
    },
    onDestroyed: function () {
    },

    events: function () {
        return [{
            'click .more-coverletter': this.toggleCoverLetter
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


    /**
     * HELPERS
     */

    /**
     * get candidate fullname
     * @returns {string}
     */
    fullname: function () {
        var can = this.candidate.get();
        if (!can) return "";
        return can.data.lastname + " " + can.data.firstname;
    },

    /**
     * get candidate job title
     * @returns {String}
     */
    jobTitle: function () {
        var can = this.candidate.get();
        if (!can) return "";
        return can.data.jobtitle;
    },

    /**
     * Cover letter
     */
    coverLetter: function () {
        if (!this.application.get())
            return "";
        var nl2br = function (str, is_xhtml) {
            var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

            return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
        };
        return nl2br(this.application.get().data.coverletter);
    },

    /**
     * get candidate city location
     * @returns {String}
     */
    city: function () {
        var can = this.candidate.get();
        if (!can) return "";
        return can.data.city;
    },
    /**
     * Get candidate phone: cellphone or homephone
     * @returns {String}
     */
    phone: function () {
        var can = this.candidate.get();
        if (!can) return "";
        return can.data.cellphone || can.data.homephone || "";
    },

    profileUrl: function () {
        var url = Meteor.settings.public.applicationUrl;
        return sprintf(url, this.applicationId.get());
    }

}).register('JobApplicationProfile');