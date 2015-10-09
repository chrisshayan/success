HiringProcess = BlazeComponent.extendComponent({
    onCreated: function() {
        var self = this;
        this.trackers = [];
        this.trackers.push(Template.instance().autorun(function () {
            var params = Router.current().params;
            self.jobId = params._id;
            self.stage = _.findWhere(Success.APPLICATION_STAGES, {alias: params.stage});
            self.subscribe("jobStagesCounter", "job_stages_" + self.jobId, self.jobId);
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
        var counter = Collections.Counts.findOne("job_stages_" + self.jobId);
        _.each(Success.APPLICATION_STAGES, function (stage) {
            stage.jobId = self.jobId;
            stage.total = "";
            if(counter)
                stage.total = counter.count[stage.id];

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