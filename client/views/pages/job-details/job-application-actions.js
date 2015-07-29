//===================================================================================================================//
// JOB APPLICATION ACTIONS
//===================================================================================================================//
JobApplicationActions = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;
        this.trackers = [];
        this.props = new ReactiveDict;
        this.props.set("jobId", Session.get("currentJobId"));
        this.props.set("stage", Session.get("currentStage"));
        this.props.set("applicationId", Session.get("currentApplicationId"));

        this.trackers.push(Template.instance().autorun(function () {
            var params = Router.current().params;
            var jobId = parseInt(params.jobId);
            var stage = _.findWhere(Recruit.APPLICATION_STAGES, {alias: params.stage});
            var applicationId = parseInt(params.query.application);
            self.props.set('applicationId', applicationId);
            var application = Collections.Applications.findOne({entryId: applicationId});
            self.props.set('application', application);

        }));
    },

    onRendered: function () {
    },
    onDestroyed: function () {
        _.each(this.tracker, function(tracker) {
            tracker.stop();
        });
    },

    events: function () {
        return [{
            'click [data-move-stage]': this.moveStage,
            'click .disqualify-application': this.disqualifyApplication,
            'click .revert-application': this.revertApplication,
            'click .toggle-email-candidate-form': this.toggleSendEmailForm,
            'click .toggle-comment-form': this.toggleCommentForm
        }];
    },

    /**
     * EVENTS
     */

    /**
     * Update application stage
     */
    moveStage: function (e, tmpl) {
        var toStage = $(e.target).data("move-stage");
        toStage = parseInt(toStage);
        var stage = Recruit.APPLICATION_STAGES[toStage];
        if (toStage) {
            //call update stage request
            var data = {
                application: this.props.get("applicationId"),
                stage: toStage
            };
            Meteor.call('updateApplicationStage', data, function (err, result) {
                if (err) throw err;
                if (result) {
                    // When update stage success
                    // remove application from list
                    // change current application
                    Notification.success(sprintf('Moved to %s successfully', stage.label));
                    Event.emit('movedApplicationStage');
                }
            });
        }
    },

    /**
     * Disqualify application
     */
    disqualifyApplication: function () {
        var self = this;
        Meteor.call('disqualifyApplication', this.props.get("applicationId"), function(err, result){
            if(err) throw err;
            self.props.set('disqualified', true);
        });
    },

    /**
     * Revert application
     */
    revertApplication: function () {
        var self = this;
        Meteor.call('revertApplication', this.props.get("applicationId"), function(err, result){
            if(err) throw err;
            self.props.set('disqualified', false);
        });
    },

    /**
     * Send email to candidate
     */
    toggleSendEmailForm: function () {
        Event.emit('toggleMailForm');
    },

    /**
     * add comment to candidate
     */
    toggleCommentForm: function () {
        Event.emit('toggleCommentForm');
    },


    /**
     * HELPERS
     */

    nextStage: function () {
        var stage = this.props.get("stage");
        if (stage.id == 5)
            return stage;
        var nextStage = Recruit.APPLICATION_STAGES[stage.id + 1];
        return nextStage;
    },
    nextStageAbility: function () {
        if (this.props.get("stage").id == 5)
            return "disabled";
        return "";
    },
    stages: function () {
        var self = this;
        var items = [];
        _.each(Recruit.APPLICATION_STAGES, function (stage) {
            var currentStage = self.props.get("stage");
            var html = "";
            if (stage.id > currentStage.id) {
                html = '<li><a href="#"  data-move-stage="%s"><i class="fa fa-long-arrow-right"></i>&nbsp;%s</a></li>';
            } else if (stage.id < currentStage.id) {
                html = '<li><a href="#" data-move-stage="%s"><i class="fa fa-long-arrow-left"></i>&nbsp;%s</a></li>';
            } else if (stage.id == currentStage.id) {
                html = '<li><a href="#" data-move-stage="%s"><i class="fa fa-circle-o"></i>&nbsp;%s</a></li>';
            }
            if (!_.isEmpty(html)) {
                html = sprintf(html, stage.id, stage.label);
            }
            items.push({html: html});
        });
        return items;
    },

    isDisqualified: function() {
        var application = this.props.get('application');
        if(!application) return false;
        return application.disqualified;
    }
}).register('JobApplicationActions');