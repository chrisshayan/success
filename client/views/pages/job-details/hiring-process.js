Template.HiringProcess.helpers({
    stages: function() {
        var stages = [];
        _.each(Recruit.APPLICATION_STAGES, function(stage) {
            stage.jobId = Router.current().params.jobId;
            stages.push( stage );
        });
        return stages;
    }
});
Template.jobStageNav.helpers({
    activeClass: function() {
        var currentStage = Router.current().params.stage;
        return currentStage == this.alias ? "active" : "";
    }
});