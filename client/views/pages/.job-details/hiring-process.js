HiringProcess = BlazeComponent.extendComponent({
    onCreated: function() {
        var self = this;
        this.trackers = [];
        this.trackers.push(Template.instance().autorun(function () {
            var params = Router.current().params;
            self.jobId = params._id;
            self.stage = _.findWhere(Success.APPLICATION_STAGES, {alias: params.stage});
        }));
    },

    onDestroyed: function() {
        _.each(this.trackers, function (tracker) {
            tracker.stop();
        });
    },

    stages: function () {
        var self = this;
        var stages = [];
        var job = Meteor.jobs.findOne({_id: self.jobId});
        var counter = job['stages'] || {};
        _.each(Success.APPLICATION_STAGES, function (stage) {
            stage.jobId = self.jobId;
            stage.total = counter[stage.id] || "";
            stages.push(stage);
        });
        return stages;
    }
}).register("HiringProcess");


jobStageNav = BlazeComponent.extendComponent({
    jobId: function() {
        return Router.current().params._id;
    },
    /**
     * Helpers
     */
    activeClass: function () {
        var currentStage = Router.current().params.stage;
        return currentStage == this.data().alias ? "active" : "";
    }

}).register('jobStageNav');