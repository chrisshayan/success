Template.HiringProcess.helpers({
    stages: function () {
        var stages = [];
        _.each(Recruit.APPLICATION_STAGES, function (stage) {
            stage.jobId = Router.current().params.jobId;
            stages.push(stage);
        });
        return stages;
    }
});


jobStageNav = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;
        this.jobId = new ReactiveVar(null);
        Template.instance().autorun(function () {
            var params = Router.current().params;
            self.jobId.set(params.jobId);
        });
    },

    events: function () {
        return [{

        }];
    },

    /**
     * Helpers
     */
    activeClass: function () {
        var currentStage = Router.current().params.stage;
        return currentStage == this.data().alias ? "active" : "";
    },

    applicationCount: function () {
        var cond = {
            jobId: parseInt(this.jobId.get()),
            stage: parseInt(this.data().id),
        };
        var applicationCount = Collections.Applications.find(cond).count();
        if (!applicationCount)
            return "";
        return sprintf("<strong>%s</strong>", applicationCount);
    }
}).register('jobStageNav');