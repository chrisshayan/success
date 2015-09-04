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
            var applicationId = params.query.application;
            if (!_.isNaN(+applicationId))
                applicationId = +applicationId;
            self.props.set('applicationId', applicationId);
            var application = Collections.Applications.findOne({entryId: applicationId});
            self.props.set('application', application);
        }));
    },

    onRendered: function () {
    },
    onDestroyed: function () {
        _.each(this.tracker, function (tracker) {
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
        var app = this.props.get('application');
        if (app.stage == 0 && toStage == 1) return;

        var stage = Recruit.APPLICATION_STAGES[toStage];
        if (stage) {
            //call update stage request
            var data = {
                application: this.props.get("applicationId"),
                stage: stage.id
            };
            Meteor.call('updateApplicationStage', data, function (err, result) {
                if (err) throw err;
                if (result) {
                    // When update stage success
                    // remove application from list
                    // change current application
                    Notification.success(sprintf('Moved to %s successfully', stage.label));
                    window.stores.JobDetailsStore.triggerMoveApplication();

                    var action = 'Change Stage';
                    var info = {
                        category: ['Recruiter', Meteor.userId()].join(':'),
                        label: ['APP_ID', data.application, app.stage, toStage].join(':')
                    };
                    console.log('info', info);
                    Utils.trackEvent(action, info);
                }
            });
        }
    },

    /**
     * Disqualify application
     */
    disqualifyApplication: function () {
        var self = this;
        var applicationId = this.props.get("applicationId");
        Meteor.call('disqualifyApplication', applicationId, function (err, result) {
            if (err) throw err;
            self.props.set('disqualified', true);
            window.stores.JobDetailsStore.triggerAppChanged();

            var action = 'Disqualify Application';
            var info = {
                category: ['Recruiter', Meteor.userId()].join(':'),
                label: ['APP_ID', applicationId].join(':')
            };

            Utils.trackEvent(action, info);
        });
    },

    /**
     * Revert application
     */
    revertApplication: function () {
        var self = this;
        var applicationId = this.props.get("applicationId");
        Meteor.call('revertApplication', applicationId, function (err, result) {
            if (err) throw err;
            self.props.set('disqualified', false);
            window.stores.JobDetailsStore.triggerAppChanged();

            var action = 'Undo Disqualify Application';
            var info = {
                category: ['Recruiter', Meteor.userId()].join(':'),
                label: ['APP_ID', applicationId].join(':')
            };

            Utils.trackEvent(action, info);
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
        var next = stage.id + 1;
        if (stage.id == 0)
            next = stage.id + 2;
        var nextStage = Recruit.APPLICATION_STAGES[next];
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
            if ((currentStage.id != 0 || stage.id != 1) && (currentStage.id != 1 || stage.id != 0)) {
                items.push({html: html});
            }
        });
        return items;
    },

    application: function () {
        var app = Collections.Applications.findOne({
            entryId: this.props.get("applicationId")
        });
        if (app) {
            this.props.set("candidateId", app.candidateId);
        }
        return app;
    },

    candidate: function () {
        return Collections.Candidates.findOne({candidateId: this.props.get("candidateId")});
    }
}).register('JobApplicationActions');