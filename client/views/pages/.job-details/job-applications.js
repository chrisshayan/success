//===================================================================================================================//
// JOB APPLICATIONS
//===================================================================================================================//
JobApplications = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;
        var instance = Template.instance();

        // check is loading data
        var params = Router.current().params;
        var stage = _.findWhere(Success.APPLICATION_STAGES, {alias: params.stage});
        this.jobId = new ReactiveVar(params._id);
        this.stage = new ReactiveVar(stage);
        this.inc = 20;
        this.page = new ReactiveVar(1);
        this.isLoading = new ReactiveVar(false);
        this.isLoadingMore = new ReactiveVar(false);

        // store all trackers involve in component
        this.trackers = [];

        if (Meteor.applications.find(self.filters()).count() <= 0) {
            this.isLoading.set(true);
        }


        var tracker = instance.autorun(function () {
            var params = Router.current().params;
            var stage = _.findWhere(Success.APPLICATION_STAGES, {alias: params.stage});
            self.jobId.set(params.jobId);
            if(!stage)
                self.stage.set(Success.APPLICATION_STAGES[1]);
            else
                self.stage.set(stage);
            // Send subscribe request
            JobDetailsSubs.subscribe('applicationCounter', self.counterName(), self.filters());

            var trackSub = JobDetailsSubs.subscribe('getApplications', self.filters(), self.options());

            if (trackSub.ready()) {
                self.isLoading.set(false);
                self.isLoadingMore.set(false);
            }

        });
        self.trackers.push(tracker);

        // Bind listener
        this.moveApplication = function () {
            if (self.fetch().count() > 0) {
                Router.go('jobDetails', {
                    jobId: self.jobId.get(),
                    stage: self.stage.get().alias
                }, {
                    query: {
                        application: Meteor.applications.findOne(self.filters(), self.options()).entryId
                    }
                });
            } else {
                Event.emit('emptyProfile');
                Router.go('jobDetails', {
                    jobId: self.jobId.get(),
                    stage: self.stage.get().alias
                });
            }
        };
        Event.on('movedApplicationStage', this.moveApplication);
    },

    onDestroyed: function () {
        Event.removeListener('movedApplicationStage', this.moveApplication);
        _.each(this.trackers, function (tracker) {
            tracker.stop();
        });
    },

    counterName: function () {
        if(this.stage.get() && this.jobId.get())
            return "job_application_" + this.jobId.get() + "_" + this.stage.get().id;
        return "";
    },

    filters: function () {
        return {
            jobId: this.jobId.get(),
            stage: this.stage.get().id
        };
    },

    total: function () {
        return this.inc * this.page.get();
    },
    maxLimit: function () {
        var counter = Collections.Counts.findOne(this.counterName());
        if (!counter) return 0;
        return counter.count;
    },

    options: function () {
        return {
            sort: {
                matchingScore: -1
            },
            limit: this.total()
        }
    },

    fetch: function () {
        return Meteor.applications.find(this.filters(), this.options());
    },

    events: function () {
        return [{
            'click .loadmore': this.loadMore
        }];
    },

    /**
     * EVENTS
     */
    loadMore: function () {
        this.isLoadingMore.set(true);
        var currentPage = this.page.get();
        var nextPage = currentPage + 1;
        this.page.set(nextPage);
    },


    /**
     * HELPERS
     */
    loadMoreAbility: function () {
        return this.maxLimit() - this.total() > 0;
    },

    items: function () {
        return this.fetch();
    }
}).register('JobApplications');


//===================================================================================================================//
// JOB APPLICATION ITEM
//===================================================================================================================//
JobApplication = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;
        this.props = new ReactiveDict;

        // Track when current application change
        Template.instance().autorun(function () {
            self.props.set("stage", Session.get("currentStage"));
            self.props.set("jobId", Session.get("currentJobId"));
            self.props.set("applicationId", self.data().entryId);
            self.props.set("candidateId", self.data().candidateId);
            self.props.set("application", self.data());
            self.props.set("matchingScore", self.data().matchingScore);

            var candidate = Meteor.candidates.findOne({candidateId: self.props.get("candidateId")});
            self.props.set("candidate", candidate);
            self.props.set("currentApplication", Session.get("currentApplicationId"));

            if (candidate)
                self.props.set("isLoading", false);
            else
                self.props.set("isLoading", true);
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
        return this.props.get('currentApplication') == this.props.get('applicationId') ? "active" : "";
    },

    /**
     * generate link to change current application
     * @returns {String}
     */
    applicationUrl: function () {
        var params = {
            jobId: this.props.get("jobId"),
            stage: this.props.get("stage").alias
        };
        var query = {query: {application: this.props.get("applicationId")}};
        return Router.routes['jobDetails'].url(params, query);
    },

    candidate: function() {
        return Meteor.candidates.findOne({candidateId: this.props.get("candidateId")});
    }
}).register('JobApplication');