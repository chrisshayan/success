JobApplicationTimeline = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;

        this.jobId = new ReactiveVar(null);
        this.stage = new ReactiveVar(null);
        this.applicationId = new ReactiveVar(null);

        this.page = new ReactiveVar(1);
        this.isLoading = new ReactiveVar(false);
        this.loadMoreAbility = new ReactiveVar(false);
        this.latestOptions = new ReactiveVar({});

        // store activities
        this.activities = new ReactiveVar([]);

        Template.instance().autorun(function () {
            var params = Router.current().params;
            var stage = _.findWhere(Recruit.APPLICATION_STAGES, {alias: params.stage});
            self.jobId.set(parseInt(params.jobId));
            self.applicationId.set(parseInt(params.query.application));
            self.stage.set(stage);

            // get job applications
            var options = {
                application: self.applicationId.get(),
                page: self.page.get()
            };

            // Component only request when options change
            var latestOptions = self.latestOptions.get();
            if (!_.isEqual(latestOptions, options)) {
                if (latestOptions.jobId != options.jobId
                    || latestOptions.stage != options.stage
                    || latestOptions.application != options.application) {
                    self.activities.set([]);
                }
                self.isLoading.set(true);

                Meteor.call("getActivities", options, function (err, result) {
                    if (err) throw err;
                    self.isLoading.set(false);
                    var currentItems = self.activities.get();
                    _.each(result.items, function (item) {
                        currentItems.push(item);
                    });
                    self.activities.set(currentItems);

                    self.loadMoreAbility.set(result.loadMoreAbility);
                    self.latestOptions.set(options);
                });
            }
        });

    },

    events: function () {
        return [{
            'click .loadmore': this.loadMore
        }];
    },

    loadMore: function() {
        var currentPage = this.page.get();
        this.page.set(currentPage+1);
    },

    /**
     * HELPERS
     */
    isEmpty: function () {
        return this.activities.get().length < 1;
    }

}).register('JobApplicationTimeline');


JobApplicationTimelineItem = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;
        this.actionType = this.data().actionType;
        this.createdAt = this.data().createdAt;
        this.icon = "";
        this.title = "";
        this.content = "";

        /**
         * info handle
         */
        switch(this.actionType) {
            case 1: // moved stage action
                var from = this.data().data.fromStage;
                var to = this.data().data.toStage;
                var stage = Recruit.APPLICATION_STAGES[to];
                if(from > to) {
                    if(from - to > 1)
                        this.icon = " fa-long-arrow-left ";
                    else
                        this.icon = " fa-arrow-left ";
                } else {
                    if(to - from > 1)
                        this.icon = " fa-long-arrow-right ";
                    else
                        this.icon = " fa-arrow-right ";
                }
                this.title = sprintf("Moved candidate to <strong>%s</strong>", stage.label);
            break;

            case 2:// Applied date
                this.title = "Applied for this position";
                this.icon = " fa-briefcase ";
            break;

            default:
                this.icon = " fa-heart-o ";
            break;
        }
    },

    events: function () {
        return [{}];
    },

    /**
     * HELPERS
     */
    /**
     * get acitivity datetime
     * if activity is today, return time
     * else return date
     * @returns {String}
     */
    datetime: function () {
        var datetime = moment(this.createdAt);
        if(datetime.diff(Date.now(),'day')) {
            return datetime.format("ll");
        }
        return datetime.format("h:mm a");
    },

    /**
     * get activity time ago
     * @returns {*}
     */
    timeago: function () {
        return moment(this.createdAt).fromNow();
    }

}).register('JobApplicationTimelineItem');