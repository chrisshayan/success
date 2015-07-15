
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

        // Track when current application change
        Template.instance().autorun(function() {
            var query = Router.current().params.query;
            if(query.hasOwnProperty('application')) {
                var applicationId = parseInt(query.application);
                self.isLoading.set(true);
                self.applicationId.set(applicationId);
                Meteor.call('getApplicationDetails', applicationId, function(err, result) {
                    if(err) throw err;
                    self.isLoading.set(false);
                    self.application.set(result.application);
                    self.candidate.set(result.candidate);
                });
            } else {
                self.application.set(null);
                self.candidate.set(null);
            }
        });

        // Bind empty event
        Event.on('emptyProfile', function() {
            self.application.set(null);
            self.candidate.set(null);
        });
    },

    onRendered: function () {
    },
    onDestroyed: function () {
    },

    events: function () {
        return [{}];
    },

    /**
     * EVENTS
     */


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
}).register('JobApplicationProfile');