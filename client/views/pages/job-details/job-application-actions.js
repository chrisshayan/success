//===================================================================================================================//
// JOB APPLICATION ACTIONS
//===================================================================================================================//
JobApplicationActions = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;
        this.applicationId = new ReactiveVar(null);
        this.stage = new ReactiveVar(null);
        this.disqualified = new ReactiveVar(false)

        Template.instance().autorun(function() {
            var params = Router.current().params;
            var _currentStage = _.findWhere(Recruit.APPLICATION_STAGES, {alias: params.stage});
            self.stage.set(_currentStage);
            if(params.query.hasOwnProperty('application')) {
                self.applicationId.set(parseInt(params.query.application));
                Meteor.call('getApplicationDetails', parseInt(params.query.application),  function(err, result) {
                    if(err) throw err;
                    if(result) {
                        self.disqualified.set(result.application.disqualified);
                    }
                })
            } else {
                self.applicationId.set(null);
            }
        });
    },

    onRendered: function () {
    },
    onDestroyed: function () {
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
    moveStage: function(e, tmpl) {
        var toStage = $(e.target).data("move-stage");
        toStage = parseInt(toStage);
        var stage = Recruit.APPLICATION_STAGES[toStage];
        if(toStage) {
            //call update stage request
            var data = {
                application: this.applicationId.get(),
                stage: toStage
            };
            Meteor.call('updateApplicationStage', data, function(err, result) {
                if(err) throw err;
                if(result) {
                    // When update stage success
                    // remove application from list
                    // change current application
                    Event.emit('movedApplicationStage', data.application);
                    Notification.success(sprintf('Moved to %s successfully', stage.label));
                }
            });
        }
    },

    /**
     * Disqualify application
     */
    disqualifyApplication: function() {
        var self = this;
        Meteor.call('disqualifyApplication', this.applicationId.get(), function(err, result) {
            if(err) throw err;
            if(result) {
                Event.emit('disqualifiedApplication', self.applicationId.get(), true);
                self.disqualified.set(true);
            }
        });
    },

    /**
     * Revert application
     */
    revertApplication: function() {
        var self = this;
        Meteor.call('revertApplication', this.applicationId.get(), function(err, result) {
            if(err) throw err;
            if(result) {
                Event.emit('disqualifiedApplication', self.applicationId.get(), false);
                self.disqualified.set(false);
            }
        });
    },

    /**
     * Send email to candidate
     */
    toggleSendEmailForm: function() {
        Event.emit('toggleSendEmailCandidateForm');
    },

    /**
     * add comment to candidate
     */
    toggleCommentForm: function() {
        Event.emit('toggleCommentCandidateForm');
    },



    /**
     * HELPERS
     */

    nextStage: function() {
        if(this.stage.get().id == 5)
            return this.stage.get();
        var nextStage = Recruit.APPLICATION_STAGES[this.stage.get().id+1];
        return nextStage;
    },
    nextStageAbility: function() {
        if(this.stage.get().id == 5)
            return "disabled";
        return "";
    },
    stages: function() {
        var self = this;
        var items = [];
        _.each(Recruit.APPLICATION_STAGES, function(stage) {
            var html = "";
            if(stage.id > self.stage.get().id) {
                html = '<li><a href="#"  data-move-stage="%s"><i class="fa fa-long-arrow-right"></i>&nbsp;%s</a></li>';
            } else if(stage.id < self.stage.get().id) {
                html = '<li><a href="#" data-move-stage="%s"><i class="fa fa-long-arrow-left"></i>&nbsp;%s</a></li>';
            } else if(stage.id == self.stage.get().id) {
                html = '<li><a href="#" data-move-stage="%s"><i class="fa fa-circle-o"></i>&nbsp;%s</a></li>';
            }
            if(!_.isEmpty(html)) {
                html = sprintf(html, stage.id, stage.label);
            }
            items.push({html: html});
        });
        return items;
    }
}).register('JobApplicationActions');