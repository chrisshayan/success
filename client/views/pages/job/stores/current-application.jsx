const ACTION_COMMENT = 1;

JobCurrentApplication = {};

JobCurrentApplication.getState = function () {
    return {
        currentAction: null,

    };
};

JobCurrentApplication.getActions = function () {
    const actions = {};

    /**
     * move to next application
     * @param nextIndex <Number>
     */
    actions.nextApplication = function (prevAppId = null) {
        let nextIndex = 0;
        let nextApp = null;
        if(prevAppId !== null) {
            nextIndex = _.findIndex(this.data.applications, (a)=>  a.appId == prevAppId);
        }
        while(true) {
            nextApp = this.data.applications[nextIndex];
            if(nextApp && nextApp.appId != prevAppId) break;
            nextIndex++;
            if(nextIndex > this.data.applications.length || nextIndex > 1000) break;
        }

        const params = Router.current().params
            , query = _.omit(params.query, 'appAction', 'appId');

        if (nextApp) {
            query['appId'] = nextApp.appId;
        }
        Router.go('Job', params, {query});
    }.bind(this);

    /**
     * check current action
     * 1: is adding comment
     * 2:
     * @param key
     * @returns {boolean}
     */
    actions.isCurrentAction = function (key) {
        return this.state.currentAction === key;
    };

    actions.toggleCommentForm = function () {
        const state = {};
        if (this.state.currentAction == ACTION_COMMENT) {
            state['currentAction'] = null;
        } else {
            state['currentAction'] = ACTION_COMMENT;
        }
        this.setState(state);
    };

    /**
     * Disqualify application
     */
    actions.disqualify = function () {
        if (_.isNumber(this.state.currentAppId)) {
            const currentAppId = this.state.currentAppId;
            const jobId = this.state.jobId;
            const appIds = [currentAppId];
            const stage = this.state.stage.alias;

            Meteor.call('applications.toggleQualify', jobId, appIds, stage, false, (err, result) => {
                if (!err && result) {
                    actions.nextApplication(currentAppId);
                }
            });
        }
    }.bind(this);


    /**
     * Revert qualify applications
     */
    actions.revertQualify = function () {
        if (_.isNumber(this.state.currentAppId)) {
            const jobId = this.state.jobId;
            const currentAppId = this.state.currentAppId;
            const appIds = [currentAppId];
            const stage = this.state.stage.alias;

            Meteor.call('applications.toggleQualify', jobId , appIds, stage, true, (err, result) => {
                if (!err && result) {
                    actions.nextApplication(this.state.currentAppId);
                }
            });
        }
    }.bind(this);


    /**
     * update application stage
     * @param appId <Number>
     * @param stage <Number>
     */
    actions.moveStage = function (stage) {
        console.log('move stage', this.state.currentAppId, ' to ', stage)

        if (_.isNumber(this.state.currentAppId)) {
            const currentAppId = this.state.currentAppId;

            Meteor.call('applications.moveStage', currentAppId, stage, (err, result) => {
                if (!err && result) {
                    actions.nextApplication(currentAppId);
                }
            });
        }
    }.bind(this);


    /**
     * Close action box and scroll to top
     * @type {function(this:JobCurrentApplication)}
     */
    actions.discardActionBox = function() {
        const params = Router.current().params
            , query = _.omit(params.query, 'appAction');

        Router.go('Job', params, { query });
        // scroll to top
        $('body').animate({scrollTop: 0}, 300);
    }.bind(this);

    /**
     * Add comment to application
     * @type {function(this:JobCurrentApplication)}
     */
    actions.saveComment = function(text) {
        const jobId = this.state.jobId;
        const appId = this.state.currentAppId;

        Meteor.call('application.addComment', jobId, appId, text, (err, result) => {
            if(!err && result) {
                actions.discardActionBox();
            } else {

            }
        });
    }.bind(this);

    /**
     * Send message to application
     * @type {function(this:JobCurrentApplication)}
     */
    actions.sendMessage = function(data) {
        const jobId = this.state.jobId;
        const appId = this.state.currentAppId;

        Meteor.call('application.sendMessage', jobId, [appId], data, (err, result) => {
            if(!err && result) {
                actions.discardActionBox();
                Notification.success("Emails sent");
            } else {

            }
        });
    }.bind(this);

    /**
     * save interview events
     * @param data
     */
    actions.scheduleInterview = function(data) {
        const jobId = this.state.jobId;
        const appId = this.state.currentAppId;

        Meteor.call('activities.scheduleInterview', jobId, appId, data, (err, result) => {
            if(!err && result) {
                actions.discardActionBox();
                Notification.success("Scheduled interview successfully");
            } else {

            }
        });
    }.bind(this);

    return actions;
};