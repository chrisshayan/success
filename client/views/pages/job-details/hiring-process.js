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

Template.jobStageNav.onCreated(function () {
    var options = {
        jobId: parseInt(this.data.jobId),
        stage: parseInt(this.data.id)
    };
    Meteor.subscribe('applicationCount', options);
});
Template.jobStageNav.helpers({
    activeClass: function () {
        var currentStage = Router.current().params.stage;
        return currentStage == this.alias ? "active" : "";
    },

    applicationCount: function () {
        var cond = {
            jobId: parseInt(this.jobId),
            stage: this.id
        };
        var applicationCount = Collections.Applications.find(cond).count();
        if (!applicationCount)
            return "";
        return sprintf("<strong>%s</strong>", applicationCount);
    }
});