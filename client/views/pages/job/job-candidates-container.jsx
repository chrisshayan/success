const { PropTypes } = React;

const PropMixin = {
    propTypes: {
        isLoading: PropTypes.bool.isRequired,
        hasMore: PropTypes.bool.isRequired,
        isEmpty: PropTypes.bool.isRequired,
        candidateType: PropTypes.number.isRequired,
        applications: PropTypes.array.isRequired,
        currentAppId: PropTypes.number,
    },

    getDefaultProps() {
        return {
            isLoading       : false,
            hasMore         : false,
            isEmpty         : false,
            candidateType   : 1,
            applications    : [],
            currentAppId    : null
        };
    }
};

const RendererMixin = {

    render__Content() {
        return (
            <div>
                <JobCandidates
                    job={this.props.job}
                    stage={this.props.stage}
                    applications={this.props.applications}
                    currentAppId={this.props.currentAppId}
                    actions={this.props.actions}/>

                {this.render__NoContent()}
                {this.render__Loading()}
                {this.render__LoadMore()}
            </div>
        );
    },

    render__NoContent() {
        const style = {
            height: '300px',
            lineHeight: '300px',
            textAlign: 'center'
        };
        return this.props.isEmpty ? <h4 style={style}>No application</h4> : null;
    },

    render__Loading() {
        return this.props.isLoading ? <WaveLoading /> : null;
    },

    render__LoadMore() {
        return this.props.hasMore
            ? <button
                    style={{ width: '95%', margin: '10px auto' }}
                    className={['btn','btn-small','btn-primary','btn-block'].join(' ')}
                    onClick={ () => this.props.actions.loadMore() }>
                    <i className="fa fa-arrow-down"/>&nbsp;
                    Load more
                </button>
            : null;
    }
};

JobCandidatesContainer = React.createClass({
    mixins: [PropMixin, RendererMixin],

    handle___SelectTab(key) {
        const params = Router.current().params;
        const query = _.omit(params.query, 'appAction');
        if (query) {
            query['candidateType'] = key;
        } else {
            params.query = {
                candidateType: key
            };
        }
        Router.go('Job', params, { query });

        this.props.actions.resetState();
    },

    render() {
        let tab1Title = 'QUALIFIED';
        let tab2Title = 'DISQUALIFIED';
        let content = null;
        if(this.props.applications) {
            content = this.render__Content();
        } else {
            content = this.render__Empty();
        }

        if (this.props.counter.disqualified > 0) {
            tab2Title = `DISQUALIFIED (${this.props.counter.disqualified})`;
        }

        const cx1 = classNames('qualify', {
            active: this.props.candidateType == 1
        });

        const cx2 = classNames('disqualified', {
            active: this.props.candidateType == 2
        });

        return (
            <div id="job-candidates-container">
                <ul className="nav nav-tabs">
                    <li role="presentation" className={cx1}>
                        <a href="#" onClick={() => this.handle___SelectTab(1)}>{tab1Title}</a>
                    </li>
                    <li role="presentation" className={cx2}>
                        <a href="#" onClick={() => this.handle___SelectTab(2)}>{tab2Title}</a>
                    </li>
                </ul>

                <JobCandidateListActions
                    hasChecked={ this.props.hasChecked }
                    isSelectedAll={ this.props.isSelectedAll }
                    disqualified={ this.props.candidateType === 2 }
                    onSearch={ this.props.actions.search }
                    onSort={ this.props.actions.sort }
                    onSelectAll={ () => this.props.actions.toggleCheckAll(true) }
                    onDeselectAll={ () => this.props.actions.toggleCheckAll(false) }
                    onBulkDisqualify={ () => this.props.actions.disqualify() }
                    onBulkRevertQualify={ () => this.props.actions.revertQualify() }
                    onBulkSendMessage={ () => this.props.actions.toggleSendMessage() }
                    />

                {content}
            </div>
        );
    }
});