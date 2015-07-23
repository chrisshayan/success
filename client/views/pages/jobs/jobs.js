Jobs = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;
        if (!this.data().hasOwnProperty("status")) return;

        var instance = Template.instance();
        var data = this.data();

        //properties
        this.status = parseInt(data.status);
        this.inc = 5;
        this.page = new ReactiveVar(1);
        this.maxLimit = new ReactiveVar(0);

        this.isLoading = new ReactiveVar(false);
        this.isLoadingMore = new ReactiveVar(false);

        this.isLoading.set(true);
        instance.autorun(function () {
            instance.subscribe('getJobs', self.filters(), self.options(), {
                onReady: function () {
                    Meteor.call("jobCounter", self.filters(), function (err, total) {
                        if (err) throw err;
                        if (total) {
                            self.maxLimit.set(total);
                        }
                    });
                    self.isLoading.set(false);
                    self.isLoadingMore.set(false);
                }
            });
        });

    },

    filters: function () {
        var filters = {};
        var today = new Date(moment().format("YYYY-MM-DD 00:00:00"));
        if (this.status == 1) {
            filters['data.expireddate'] = {
                $gte: today
            }
        } else {
            filters['data.expireddate'] = {
                $lt: today
            }
        }
        return filters;
    },

    options: function () {
        return {
            limit: this.limit(),
            sort: {
                "data.createddate": -1
            }
        };
    },

    limit: function () {
        return this.page.get() * this.inc;
    },

    fetch: function () {
        return Collections.Jobs.find(this.filters(), this.options());
    },

    events: function () {
        return [{
            'click [data-load-more="true"]': this.loadMore
        }];
    },

    loadMore: function () {
        this.isLoadingMore.set(true);
        var currentPage = this.page.get();
        this.page.set(currentPage + 1);
    },

    /**
     * Helpers
     */
    items: function () {
        return this.fetch();
    },

    total: function () {
        return this.maxLimit.get();
    },

    loadMoreAbility: function () {
        return this.total() - this.limit() > 0;
    }

}).register('Jobs');

JobItem = BlazeComponent.extendComponent({
    onCreated: function () {
        var job = this.data();
        this.jobId = job.jobId;
        this.title = job.data.jobtitle;
        this.createdAt = moment(job.createdAt).format("DD-MM-YYYY");
        this.expiredAt = moment(job.data.expireddate).format("DD-MM-YYYY");

        this.stages = new ReactiveDict;
        this.counting = new ReactiveVar(false);

        // store all trackers involve in component
        this.trackers = [];
    },

    onRendered: function () {
        var self = this;
        this.trackers.push(Template.instance().autorun(function () {
            Meteor.defer(function() {
                self.counting.set(true);
                Meteor.call('getJobStagesCount', self.jobId, function (err, stages) {
                    if (err) throw err;
                    self.counting.set(false);
                    _.each(stages, function (count, id) {
                        self.stages.set(id, count);
                    });
                });
            });
        }));
    },

    onDestroyed: function () {
        _.each(this.trackers, function (tracker) {
            tracker.stop();
        });
    },

    /**
     * Helpers
     */
    // Get number of application in job's stage
    counter: function (id) {
        if(this.counting.get()) return "...";
        return this.stages.get(id) || "-";
    }
}).register('JobItem');