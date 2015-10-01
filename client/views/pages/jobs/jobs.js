Jobs = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;
        if (!this.data().hasOwnProperty("status")) return;


        var instance = Template.instance();
        var data = this.data();

        //properties
        this.status = +data.status;
        this.inc = 5;
        this.page = new ReactiveVar(1);
        this.today = new Date(moment().format("YYYY-MM-DD 00:00:00"));

        this.isLoading = new ReactiveVar(false);
        this.isLoadingMore = new ReactiveVar(false);

        if (Collections.Jobs.find({}, {limit: 1}).count() !== 1)
            this.isLoading.set(true);

        instance.autorun(function () {
            self.subscribe('jobCounter', self.counterName(), self.filters());
            var trackSub = DashboardSubs.subscribe('getJobs', self.filters(), self.options());
            if (trackSub.ready()) {
                self.isLoading.set(false);
                self.isLoadingMore.set(false);
            }
        });
    },

    counterName: function () {
        var data = this.data();
        return ['jobs_status', data.source, data.status].join('_');
    },

    filters: function () {
        var data = this.data();
        var filters = {
            status: data.status
        };

        if (data.source) {
            filters['source'] = data.source;
        }

        if (Meteor.currentRecruiter().showMyJob && Meteor.currentRecruiter().email) {
            filters['recruiterEmails'] = Meteor.currentRecruiter().email;
        }

        var tags = Session.get('jobFilterTags') || [];
        if (tags.length > 0) {
            filters['$or'] = [
                {
                    title: {
                        $regex: '(' + tags.join('|') + ')',
                        $options: 'i'
                    }
                },
                {
                    tags: {
                        $regex: '(' + tags.join('|') + ')',
                        $options: 'i'
                    }
                }
            ];
        }
        return filters;
    },

    options: function () {
        return {
            limit: this.limit(),
            sort: {
                "createdAt": -1
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
        var counter = Collections.Counts.findOne(this.counterName());
        if (!counter) return 0;
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

        this.stages = new ReactiveDict;
        this.counting = new ReactiveVar(false);

        // store all trackers involve in component
        this.trackers = [];
    },

    onRendered: function () {
        var self = this;
        var instance = Template.instance();
        self.searchId = null;
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
        if (!counter) return "-";
        return counter.count[id] || "-";
    },

    timeago: function (d) {
        return moment(d).format("DD-MM-YYYY");
    }
}).register('JobItem');


filterByEmail = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;
        this.emails = new ReactiveVar([]);
        this.showMyJob = new ReactiveVar(false);

        (Meteor.currentRecruiter()) && this.showMyJob.set(Meteor.currentRecruiter().showMyJob);

        Meteor.call('getEmailList', function (err, result) {
            self.emails.set(result);
            $('.chosen-select').val(Meteor.currentRecruiter().email || '');

        });
    },

    onRendered: function () {
        var showTab = (Meteor.currentRecruiter().showMyJob) ? '.my-job' : '.all-job';
        $(showTab).trigger('click');
    },

    events: function () {
        return [{
            'change .chosen-select': function (e) {
                var value = $(e.target).val();
                Meteor.setRecruiterEmail(value);
            },
            'click .select-list-job a': function (e) {
                e.preventDefault();

                var $this = $(e.target).closest('a');
                $this.siblings('a').removeClass('active text-muted');
                $this.addClass('active text-muted');

                var showMine = $this.hasClass('my-job');
                $('.select-email-list').toggle(showMine);
                Meteor.setShowMyJob(showMine);
            }
        }]
    },

    onDestroyed: function () {
    },

    emailList: function () {
        return this.emails.get();
    },
    isSelectedEMail: function (email) {
        return (Meteor.currentRecruiter().email === email);
    }


    /**
     * Helpers
     */
    // Get number of application in job's stage
    /*counter: function (id) {
     var counter = Collections.Counts.findOne("job_stages_" + this.jobId);
     if (!counter) return "-";
     return counter.count[id] || "-";
     }*/
}).register('filterByEmail');

