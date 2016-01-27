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
     * Scroll to top
     * @type {function(this:JobCurrentApplication)}
     */
    actions.scrollTop = function (offsetTop = 0) {
        const $body = $('body');
        if ($body.scrollTop() >= offsetTop) {
            $('body').animate({scrollTop: 0}, 300);
        }
    }.bind(this);

    /**
     * move to next application
     * @param nextIndex <Number>
     */
    actions.nextApplication = function (prevAppId = null) {
        let nextIndex = 0;
        let nextApp = null;
        if (prevAppId !== null) {
            nextIndex = _.findIndex(this.data.applications, (a)=> a.appId == prevAppId);
        }
        while (true) {
            nextApp = this.data.applications[nextIndex];
            if (nextApp && nextApp.appId != prevAppId) break;
            nextIndex++;
            if (nextIndex > this.data.applications.length || nextIndex > 1000) break;
        }

        const params = Router.current().params
            , query = _.omit(params.query, 'appAction', 'appId', 'appType');

        if (nextApp) {
            query['appId'] = nextApp.appId;
            query['appType'] = nextApp.type;
        }

        actions.scrollTop(140);

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

                    GAnalytics.event(['Recruiter', Meteor.userId()].join(':'),
                        'qualify:disqualified',
                        ['appId'].concat(appIds).join(':')
                    );
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

            Meteor.call('applications.toggleQualify', jobId, appIds, stage, true, (err, result) => {
                if (!err && result) {
                    actions.nextApplication(this.state.currentAppId);
                    GAnalytics.event(['Recruiter', Meteor.userId()].join(':'),
                        'qualify:revert_disqualified',
                        ['appId'].concat(appIds).join(':')
                    );
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
        if (_.isNumber(this.state.currentAppId)) {
            const currentAppId = this.state.currentAppId;

            Meteor.call('applications.moveStage', currentAppId, stage, (err, result) => {
                if (!err && result) {
                    actions.nextApplication(currentAppId);

                    GAnalytics.event(['Recruiter', Meteor.userId()].join(':'),
                        'moveStage',
                        ['appId', currentAppId, 'stage', stage].join(':')
                    );
                }
            });
        }
    }.bind(this);


    /**
     * Close action box and scroll to top
     * @type {function(this:JobCurrentApplication)}
     */
    actions.discardActionBox = function () {
        const params = Router.current().params
            , query = _.omit(params.query, 'appAction');

        actions.scrollTop();
        Router.go('Job', params, {query});
    }.bind(this);

    /**
     * Add comment to application
     * @type {function(this:JobCurrentApplication)}
     */
    actions.saveComment = function (text) {
        const jobId = this.state.jobId;
        const appId = this.state.currentAppId;

        Meteor.call('application.addComment', jobId, appId, text, (err, result) => {
            if (!err && result) {
                actions.discardActionBox();

                GAnalytics.event(['Recruiter', Meteor.userId()].join(':'),
                    'submit_info:add_comment',
                    ['appId', appId].join(':')
                );

            } else {

            }
        });
    }.bind(this);

    /**
     * Send message to application
     * @type {function(this:JobCurrentApplication)}
     */
    actions.sendMessage = function (data) {
        const jobId = this.state.jobId;
        const appId = this.state.currentAppId;

        Meteor.call('application.sendMessage', jobId, [appId], data, (err, result) => {
            if (!err && result) {
                actions.discardActionBox();
                Notification.success("Emails sent");

                // eventvalue = 'sendMessage' = 1
                GAnalytics.event(['Recruiter', Meteor.userId()].join(':'),
                    'submit_info:send_email',
                    ['appId', appId].join(':')
                );


            } else {

            }
        });
    }.bind(this);

    /**
     * save interview events
     * @param data
     */
    actions.scheduleInterview = function (data) {
        const jobId = this.state.jobId;
        const appId = this.state.currentAppId;

        Meteor.call('application.scheduleInterview', jobId, appId, data, (err, result) => {
            if (!err && result) {
                swal("Scheduled interview successfully", "", "success");
                actions.discardActionBox();

                // eventvalue = 'schedule' = 2
                GAnalytics.event(['Recruiter', Meteor.userId()].join(':'),
                    'submit_info:schedule_interview',
                    ['appId', appId].join(':')
                );

            } else {

            }
        });
    }.bind(this);

    /**
     * Submit score card
     * @param data
     */
    actions.submitScorecard = function (data) {
        const jobId = this.state.jobId;
        const appId = this.state.currentAppId;
        const appType = this.state.currentAppType;

        data.jobId = jobId;
        data.appId = appId;
        data.type = appType;

        Meteor.call('submitScoreCard', data, (err, result) => {
            if (!err) {
                if (result) {
                    swal("Score candidate successfully", "", "success");
                    actions.discardActionBox();
                    return;
                }
            }
            swal("Error", "", "error");
            console.log(err, result);
        });

    }.bind(this);


    actions.changeTab = function (tabState = 2) {
        this.setState({tabState});
    }.bind(this);


    actions.changeCurrentAppType = function (currentAppType = null) {
        if (this.state.currentAppType != currentAppType) {
            this.setState({currentAppType});
        }
    }.bind(this);


    return actions;
};