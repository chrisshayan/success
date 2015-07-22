
JobInfo = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;

        this.page = new ReactiveVar(1);
        this.inc = 5;

        this.job = this.data().job;

        Template.instance().subscribe('jobs', {
            status: this.job.status,
            limit: this.limit(),
            except: [this.job.jobId]
        });
    },

    limit: function() {
        return this.page.get() * this.inc;
    },

    fetchOtherJobs: function() {
        var filters = {
            jobId: {
                $nin: [this.job.jobId]
            }
        };
        var today = new Date(moment().format("YYYY-MM-DD 00:00:00"));
        if(this.job.status == 1) {
            filters['data.expireddate'] = {
                $gte: today
            }
        } else {
            filters['data.expireddate'] = {
                $lt: today
            }
        }

        var options = {
            limit: this.limit()
        };
        return Collections.Jobs.find(filters, options);
    },

    events: function () {
        return [{
        }];
    },

    currentJobTitle: function() {
        return this.job.data.jobtitle;
    },

    otherJobs: function() {
        return this.fetchOtherJobs();
    }


}).register('JobInfo');


Template.JobInfoItem.helpers({
    title: function() {
        return this.data.jobtitle;
    }
});