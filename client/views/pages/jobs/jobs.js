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

        this.isLoading = new ReactiveVar(false);
        this.isLoadingMore = new ReactiveVar(false);

        if(Collections.Jobs.find({}, {limit: 1}).count() !== 1 )
            this.isLoading.set(true);

        instance.autorun(function () {
            DashboardSubs.subscribe('jobCounter', 'jobs_status_' + self.status, self.filters());
            var trackSub = DashboardSubs.subscribe('getJobs', self.filters(), self.options());
            if(trackSub.ready()) {
                self.isLoading.set(false);
                self.isLoadingMore.set(false);
            }
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
        var currentPage = this.page.get();
        this.page.set(currentPage + 1);
        this.isLoadingMore.set(true);
    },

    /**
     * Helpers
     */
    items: function () {
        return this.fetch();
    },

    total: function () {
        var counter = Collections.Counts.findOne("jobs_status_" + this.status);
        if(!counter) return 0;
        return counter.count;
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
            DashboardSubs.subscribe("jobStagesCounter", "job_stages_" + self.jobId, self.jobId);
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
        var counter = Collections.Counts.findOne("job_stages_" + this.jobId);
        if(!counter) return "-";
        return counter.count[id] || "-";
    }
}).register('JobItem');