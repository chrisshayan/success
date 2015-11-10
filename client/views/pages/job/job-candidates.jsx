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
            selectedItems: [this.props.currentAppId]
        };
    },

    getMeteorData() {
        if (!this.props.job) return {isReady: false, applications: [], total: 0};
        let subData = [this.filter(), this.option()];
        let isReady = this.props.subCache.subscribe('getApplications', ...subData).ready();
        return {
            isReady: isReady,
            applications: Collections.Applications.find(...subData).fetch(),
            total: Collections.Applications.find(this.filter()).count()
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

    render() {
        let Loading = null,
            LoadMore = null,
            noContent = null;

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

        return (
            <div>
                <JobCandidateListActions
                    onSearch={this.handleSearch}
                    onSort={this.handleSort}
                    onSelectAll={ () => { this.setState({isSelectAll: true}) } }
                    onDeselectAll={ () => { this.setState({isSelectAll: false, selectedItems: [this.props.currentAppId]}) } }/>

                {this.data.applications.map(this.renderApp) }
                {noContent}
                {Loading}
                {LoadMore}
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
        let checked = this.props.currentAppId || this.state.isSelectAll;
        return <JobCandidate
            key={key}
            app={app}
            checked={checked}
            currentAppId={this.props.currentAppId}/>;
    }
});