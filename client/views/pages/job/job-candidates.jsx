JobCandidates = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        job: React.PropTypes.object,
        stage: React.PropTypes.object,
        disqualified: React.PropTypes.bool
    },

    getInitialState() {
        return {
            inc: 10,
            limit: 10,
            total: 0,
            q: '',
            sortBy: 'createdAt',
            sortType: -1,
            selectedItems: [this.props.currentAppId],
            isSendBulkMessage: false
        };
    },

    getMeteorData() {
        if (!this.props.job) return {isReady: false, applications: [], total: 0};
        let subData = [this.filter(), this.option()];
        let isReady = this.props.subCache.subscribe('getApplications', ...subData).ready();
        return {
            isReady: isReady,
            applications: Meteor.applications.find(...subData).fetch(),
            total: Meteor.applications.find(this.filter()).count()
        };
    },

    filter() {
        let f = {},
            q = this.state.q;

        if (q.length > 0) {
            let searchCriteria = [];
            searchCriteria.push({
                'candidateInfo.fullname': {
                    '$regex': q,
                    '$options': 'i'
                }
            });

            searchCriteria.push({
                'candidateInfo.emails': {
                    '$regex': q,
                    '$options': 'i'
                }
            });
            f['$or'] = searchCriteria;
        }
        f['jobId'] = this.props.job.jobId;
        f['stage'] = this.props.stage.id;
        f['disqualified'] = this.props.disqualified;
        return f;
    },

    option() {
        let opt = {};
        opt['limit'] = this.state.limit;
        opt['sort'] = {};
        opt['sort'][this.state.sortBy] = this.state.sortType;
        return opt;
    },

    componentWillUpdate(nextProps, nextState) {
        if (this.props.currentAppId != nextProps.currentAppId) {
            this.setState({
                selectedItems: [nextProps.currentAppId]
            });
        }
    },

    componentDidUpdate() {
        this.props.onUpdateCounter();
    },

    handleSearch(q) {
        this.setState({q: q});
    },

    handleSort(field, type) {
        this.setState({
            sortBy: field,
            sortType: type
        });
    },


    handleToggleSelectApp(appId, check) {
        let selectedItems = this.state.selectedItems;
        if (check) {
            selectedItems.push(appId);
        } else {
            selectedItems = _.without(selectedItems, appId);
        }
        if (!_.isEqual(selectedItems, this.state.selectedItems)) {
            this.setState({selectedItems: selectedItems});
        }
    },

    handleSelectAll() {
        let appIds = _.pluck(this.data.applications, '_id');
        this.setState({
            selectedItems: appIds
        });
    },

    handleDeselectAll() {
        this.setState({
            selectedItems: [this.props.currentAppId]
        });
    },

    initializeAppContainerStyle(){
        var height = 115
            , row = 5;

        return {
            height: height * row + 'px',
            'overflow-x': 'hidden'

        };
    },

    handleBulkDisqualify() {
        let selectedItems = this.state.selectedItems;

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
            Meteor.call('disqualifyApplications', selectedItems);
            swal("Disqualifed!", "", "success");
            this.handleDeselectAll();
        });
    },

    handleBulkRevertQualify() {
        let selectedItems = this.state.selectedItems;

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
            Meteor.call('revertQualifyApplications', selectedItems);
            swal("Revert qualify!", "", "success");
            this.handleDeselectAll();
        });
    },

    handleBulkSendMessage() {
        this.setState({
            isSendBulkMessage: true
        });
    },

    handleDiscardBulkSendMessage() {
        this.handleDeselectAll();
        this.setState({
            isSendBulkMessage: false
        });
    },

    bulkMessageTo() {
        let result = {appIds: [], emails: []};
        //let apps = Collections.Applications.find({_id: {$in: this.state.selectedItems}}).fetch();
        let apps = Meteor.applications.find({_id: {$in: this.state.selectedItems}}).fetch();
        if (!_.isEmpty(apps)) {
            _.each(apps, (app) => {
                result.appIds.push(app._id);
                if (app['candidateInfo'] && app['candidateInfo']['emails']) {
                    result.emails.push(app.candidateInfo.emails[0]);
                }
            });
        }
        return result;
    },

    render() {
        let Loading = null
            , LoadMore = null
            , noContent = null
            , action = null;

        if (!this.data.isReady) {
            Loading = <WaveLoading />;
        } else {
            if (this.state.q.length > 0 && this.data.applications.length <= 0) {
                noContent = (
                    <h3 className="no-content">Your search returned no matches</h3>
                );
            }

            if (this.state.q <= 0 && this.data.applications.length <= 0) {
                noContent = (
                    <h3 className="no-content">No application</h3>
                );
            }
        }

        if (this.data.total > this.state.limit) {
            LoadMore = (
                <div className="row">
                    <div className="col-md-10 col-md-offset-1" style={{padding: '10px 0'}}>
                        <button
                            className='btn btn-block btn-outline btn-default'
                            onClick={() => {this.setState({limit: this.state.inc + this.state.limit})}}>
                            Load more
                        </button>
                    </div>
                </div>
            );
        }

        if (this.state.isSendBulkMessage) {
            action =
                <BulkMessageBox to={this.bulkMessageTo()} show={this.state.isSendBulkMessage}
                                onDiscard={this.handleDiscardBulkSendMessage}/>
        }

        var appContainerStyle = this.initializeAppContainerStyle();
        
        return (
            <div>
                <JobCandidateListActions
                    disqualified={this.props.disqualified}
                    onSearch={this.handleSearch}
                    onSort={this.handleSort}
                    onSelectAll={ this.handleSelectAll  }
                    onDeselectAll={ this.handleDeselectAll}
                    onBulkDisqualify={this.handleBulkDisqualify}
                    onBulkRevertQualify={this.handleBulkRevertQualify}
                    onBulkSendMessage={this.handleBulkSendMessage}
                />
                <div className="result-container" style={appContainerStyle}>
                    {this.data.applications.map(this.renderApp) }
                    {noContent}
                    {Loading}
                    {LoadMore}
                    {action}
                </div>
            </div>
        );
    },

    handleCheckApp(applicationId) {
        let selected = this.state.selectedItems;
        selected.push(applicationId);
        this.setState({
            selectedItems: _.unique(selected)
        });
    },

    handleUncheckApp(applicationId) {
        let selected = this.state.selectedItems;
        selected = _.without(selected, applicationId);
        this.setState({
            selectedItems: _.unique(selected)
        });
    },

    renderApp(app, key) {
        let checked = this.state.selectedItems.indexOf(app._id) >= 0;
        return <JobCandidate
            key={key}
            app={app}
            checked={checked}
            onToggleSelectApp={this.handleToggleSelectApp}
            currentAppId={this.props.currentAppId}/>;
    }
});

let {Modal} = ReactBootstrap;

BulkMessageBox = React.createClass({
    render() {
        return (
            <Modal
                onHide={this.props.onDiscard}
                bsSize='large' show={this.props.show}>
                <MailComposer to={this.props.to} onDiscard={this.props.onDiscard}/>
            </Modal>
        );
    }
});

