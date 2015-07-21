//===================================================================================================================//
// JOB APPLICATIONS
//===================================================================================================================//
JobApplications = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;

        // check is loading data
        this.jobId = new ReactiveVar(null);
        this.stage = new ReactiveVar(null);
        this.page = new ReactiveVar(1);
        this.isLoading = new ReactiveVar(false);
        this.latestOptions = new ReactiveVar({});

        // items
        this.applications = function() {
            return Collections.Applications.find();
        }

        Template.instance().autorun(function () {
            var params = Router.current().params;
            var stage = _.findWhere(Recruit.APPLICATION_STAGES, {alias: params.stage});
            self.jobId.set(parseInt(params.jobId));
            self.stage.set(stage);

            // get job applications
            var options = {
                jobId: self.jobId.get(),
                stage: self.stage.get().id,
                page: self.page.get()
            };
            // Send subscribe request
            Meteor.subscribe('JobApplications', options);
        });

        // Bind listener
        Event.on('movedApplicationStage', function(applicationId) {
            if(self.applications().count() > 0) {
                Router.go('jobDetails', {
                    jobId: self.jobId.get(),
                    stage: self.stage.get().alias
                }, {
                    query: {
                        application: Collections.Applications.findOne().entryId
                    }
                });
            } else {
                Event.emit('emptyProfile');
                Router.go('jobDetails', {
                    jobId: self.jobId.get(),
                    stage: self.stage.get().alias
                });
            }
        });
    },

    onRendered: function () {
    },

    onDestroyed: function () {

    },

    events: function () {
        return [{
            'click .loadmore': this.loadMore
        }];
    },

    /**
     * EVENTS
     */
    loadMore: function() {
        var currentPage = this.page.get();
        var nextPage = currentPage+1;
        this.page.set(nextPage);
    },


    /**
     * HELPERS
     */
    loadMoreAbility: function() {
        if(!this.stage.get()) return false;
        var stage = this.stage.get();
        switch (stage.id) {
            case 1:
                return Counts.get('stageAppliedCount') - this.applications().count() > 0;

            case 2:
                return Counts.get('stagePhoneCount') - this.applications().count() > 0;
            case 3:
                return Counts.get('stageInterviewCount') - this.applications().count() > 0;
            case 4:
                return Counts.get('stageOfferCount') - this.applications().count() > 0;
            case 5:
                return Counts.get('stageHiredCount') - this.applications().count() > 0;
            default:
                return false;
        }
    },

    items: function () {
        return this.applications();
    }
}).register('JobApplications');


//===================================================================================================================//
// JOB APPLICATION ITEM
//===================================================================================================================//
JobApplication = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;
        var params = Router.current().params;
        var stage = _.findWhere(Recruit.APPLICATION_STAGES, {alias: params.stage});

        this.jobId = params.jobId;
        this.stage = stage;
        this.userId = this.data().userId;
        this.isLoading = new ReactiveVar(false);
        this.application = this.data().data;
        this.candidate = Collections.Candidates.findOne({userId: this.userId});
        this.applicationId = this.data().entryId;
        this.currentApplication = new ReactiveVar("");
        this.matchingScore = this.data().matchingScore;
        // Track when current application change
        Template.instance().autorun(function() {
            var params = Router.current().params;
            if(params.query.hasOwnProperty('application')) {
                self.currentApplication.set(params.query.application);
            }
        });
    },


    /**
     * HELPERS
     */

    /**
     * check state active
     * @returns {string}
     */
    activeClass: function () {
        return this.currentApplication.get() == this.applicationId ? "active" : "";
    },

    /**
     * generate link to change current application
     * @returns {String}
     */
    applicationUrl: function () {
        var params = {jobId: this.jobId, stage: this.stage.alias};
        var query = {query: {application: this.applicationId}};
        return Router.routes['jobDetails'].url(params, query);
    },

    /**
     * Get 2 lines of cover letter
     * @returns {String}
     */
    shortCoverLetter: function() {
        if(!this.application.coverletter) return "";
        return this.application.coverletter.split(/\s+/).splice(0, 14).join(" ") + "...";
    },

    /**
     * Get matching score label
     * @returns {String}
     */
    matchingScoreLabel: function() {
        if( this.matchingScore >= 90 )
            return " label-success ";
        if( this.matchingScore >= 70 )
            return " label-primary ";
        if( this.matchingScore >= 50 )
            return " label-warning ";

        return " label-default ";
    },

    timeago: function() {
        var latestDate = this.application.createddate;
        return moment(latestDate).fromNow();
    },

    /**
     * get candidate fullname
     * @returns {string}
     */
    fullname: function () {
        var can = this.candidate;
        if (!can) return "";
        return can.data.lastname + " " + can.data.firstname;
    },

    /**
     * get candidate city location
     * @returns {String}
     */
    city: function () {
        var can = this.candidate;
        if (!can) return "";
        return can.data.city;
    },
    /**
     * Get candidate phone: cellphone or homephone
     * @returns {String}
     */
    phone: function () {
        var can = this.candidate;
        if (!can) return "";
        return can.data.cellphone || can.data.homephone || "";
    },
}).register('JobApplication');