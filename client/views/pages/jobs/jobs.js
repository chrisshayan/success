Jobs = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;
        if(!this.data().hasOwnProperty("status")) return;

        var instance = Template.instance();
        var data = this.data();

        //properties
        this.status = parseInt(data.status);
        this.inc = 5;
        this.page = new ReactiveVar(1);

        this.isLoading = new ReactiveVar(false);
        this.isLoadingMore = new ReactiveVar(false);

        this.isLoading.set(true);
        instance.autorun(function() {
            var filters = {
                status: self.status,
                limit: self.page.get() * self.inc
            };
            instance.subscribe('jobs', filters);
            instance.subscribe('applicationCount', filters, {
                onReady: function() {
                    self.isLoading.set(false);

                    //if is loading more jobs
                    if(self.isLoadingMore.get()) {
                        self.isLoadingMore.set(false);
                    }

                }
            });
        });

    },

    filters: function() {
        var filters = {};
        var today = new Date(moment().format("YYYY-MM-DD 00:00:00"));
        if(this.status == 1) {
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

    options: function() {
        return {
            limit: this.limit(),
            sort: {
                "data.createddate": -1
            }
        };
    },

    limit: function() {
        return this.page.get() * this.inc;
    },

    fetch: function() {
        return Collections.Jobs.find(this.filters(), this.options());
    },

    events: function () {
        return [{
            'click [data-load-more="true"]': this.loadMore
        }];
    },

    loadMore: function() {
        this.isLoadingMore.set(true);
        var currentPage = this.page.get();
        this.page.set(currentPage+1);
    },

    /**
     * Helpers
     */
    items: function() {
        return this.fetch();
    },

    total: function() {
        return Counts.get('jobsStatusCount_' + this.status);
    },

    loadMoreAbility: function() {
        return this.total() - this.limit() > 0;
    }

}).register('Jobs');


Template.jobItem.helpers({
    title: function () {
        return this.data.jobtitle;
    },
    appliedCount: function () {
        return Collections.Applications.find({jobId: this.jobId, stage: 1}).count() || "-";
    },
    phoneScreenCount: function () {
        return Collections.Applications.find({jobId: this.jobId, stage: 2}).count() || "-";
    },
    interviewCount: function () {
        return Collections.Applications.find({jobId: this.jobId, stage: 3}).count() || "-";
    },
    offerCount: function () {
        return Collections.Applications.find({jobId: this.jobId, stage: 4}).count() || "-";
    },
    hiredCount: function () {
        return Collections.Applications.find({jobId: this.jobId, stage: 5}).count() || "-";
    },
    createdTimeago: function() {
        var distance = (new Date() - new Date(this.data.createddate)) / (24 * 60 * 60 * 1000);
        distance = Math.ceil(distance);
        if( distance > 7)
            return moment(this.data.createddate).format('DD MMM YYYY');
        return moment(this.data.createddate).fromNow();
    }
});
