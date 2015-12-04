JobApplications = {};
JobApplications.getState = function() {
    return {
        apps__base: 10,
        apps__limit: 10,
        apps__sortField: 'appliedDate',
        apps__sortType: -1,
        apps__search: '',
        apps__counter: {
            qualify: 0,
            disqualified: 0
        },
        apps__selectedItems: [],
        apps__isSelectedAll: false,
        apps__showSendBulkMessage: false,
        apps__hasMore: false
    }
};

JobApplications.getActions = function() {
    const actions = {};

    actions.resetState = function() {
        this.setState(JobApplications.getState());
    }.bind(this);

    /**
     * Load more
     */
    actions.loadMore = function () {
        this.setState({
            apps__limit: this.state.apps__limit + this.state.apps__base
        });
    }.bind(this);

    /**
     * search applications
     * @param q <String> search query
     */
    actions.search = function (q = '') {
        this.setState({
            apps__search: q,
            apps__limit: this.state.apps__base
        });
    }.bind(this);

    /**
     * check/uncheck application
     * @param appId  <Number>
     * @param status <Bool>
     */
    actions.toggleCheck = function (appId, status) {
        if (appId) {
            let apps__selectedItems = this.state.apps__selectedItems;
            if (status === true) {
                apps__selectedItems.push(appId);
            } else {
                apps__selectedItems = _.without(apps__selectedItems, appId);
            }
            apps__selectedItems = _.unique(apps__selectedItems);
            this.setState({apps__selectedItems});
        }
    }.bind(this);

    /**
     * toggle check/uncheck all applications
     * @param status <Bool>
     */
    actions.toggleCheckAll = function (status = true) {
        if (status === true) {
            const apps__selectedItems = _.pluck(this.data.applications, 'appId');
            const apps__isSelectedAll = true;
            this.setState({apps__selectedItems, apps__isSelectedAll});
        } else {
            const apps__isSelectedAll = false;
            this.setState({apps__selectedItems: [], apps__isSelectedAll});
        }
    }.bind(this);

    /**
     * check application is selected
     * @param appId <Number>
     * @return <Bool>
     */
    actions.isChecked = function (appId) {
        return this.state.apps__selectedItems.indexOf(appId) >= 0;
    }.bind(this);

    /**
     * switch sort
     * @param apps__sortField <String> sort by field
     * @param apps__sortType <Number> -1|1
     */
    actions.sort = function (apps__sortField = 'appliedDate', apps__sortType = -1) {
        this.setState({
            apps__sortField,
            apps__sortType
        });
    }.bind(this);

    /**
     * Disqualify applications
     * appIds <Array>
     */
    actions.disqualify = function (appIds = []) {
        const stage = this.state.stage.alias;
        const jobId = this.state.jobId;
        const apps__selectedItems = this.state.apps__selectedItems;
        swal({
            title: "Are you sure?",
            text: "They don't qualify for this job?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            closeOnConfirm: false,
            html: false
        }, () => {
            Meteor.call('applications.toggleQualify', jobId, apps__selectedItems, stage, false, (err, result) => {
                if (!err && result) {
                    actions.toggleCheckAll(false);
                    swal("Disqualifed!", "", "success");
                }
            });
        });
    }.bind(this);

    /**
     * revert application's qualify
     */
    actions.revertQualify = function (appIds = []) {
        const stage = this.state.stage.alias;
        const jobId = this.state.jobId;
        const apps__selectedItems = this.state.apps__selectedItems;
        swal({
            title: "Are you sure?",
            text: "They are qualify for this job?",
            type: "info",
            showCancelButton: true,
            confirmButtonColor: "#1ab394",
            confirmButtonText: "Yes",
            closeOnConfirm: false,
            html: false
        }, () => {
            Meteor.call('applications.toggleQualify', jobId, apps__selectedItems, stage, true, (err, result) => {
                if (!err && result) {
                    actions.toggleCheckAll(false);
                    swal("Reverted qualify!", "", "success");
                }
            });
        });
    }.bind(this);

    /**
     * toggle show send bulk message
     */
    actions.toggleSendMessage = function (status = null) {
        if(status === null) {
            status = !this.state.apps__showSendBulkMessage;
        }
        this.setState({
            apps__showSendBulkMessage: status
        });

        if(status === false) {
            actions.toggleCheckAll(false);
        }
    }.bind(this);

    /**
     * Send bulk messages
     * @type {function(this:JobApplications)}
     */
    actions.sendMessage = function (data) {
        const jobId = this.state.jobId;
        const appIds = this.state.apps__selectedItems;

        Meteor.call('application.sendMessage', jobId, appIds, data, (err, result) => {
            if(!err && result) {
                actions.toggleSendMessage(false);
                Notification.success("Emails sent");
            } else {

            }
        });
    }.bind(this);

    return actions;
};
