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

    /**
     * Helpers
     */
    activeClass: function () {
        var currentStage = Router.current().params.stage;
        return currentStage == this.data().alias ? "active" : "";
    },

    /**
     * return application count
     */
    applicationCount: function () {
        switch (this.data().id) {
            case 1:
                applicationCount = Counts.get("stageAppliedCount");
                break;
            case 2:
                applicationCount = Counts.get("stagePhoneCount");
                break;
            case 3:
                applicationCount = Counts.get("stageInterviewCount");
                break;
            case 4:
                applicationCount = Counts.get("stageOfferCount");
                break;
            case 5:
                applicationCount = Counts.get("stageHiredCount");
                break;
            default:
                applicationCount = 0;
        }
        if(applicationCount < 1)
            return "";
        return sprintf("<strong>%s</strong>", applicationCount);
    }


}).register('jobStageNav');