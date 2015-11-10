JobCandidate = React.createClass({
    contextTypes: {
        selectApplication: React.PropTypes.func
    },

    handleClickApp(e) {
        e.preventDefault();
        this.context.selectApplication(this.props.app._id);
    },

    render() {
        let app = this.props.app;

        let styles = {
            container: {},

            checkbox: {
                width: '10%',
                minWidth: '30px',
                textAlign: 'center',
                paddingTop: '5px'
            },

            content: {
                width: '88%',
                padding: '10px'
            }
        };

        let appliedTimeago = moment(app.createdAt.toISOString()).fromNow();
        let isCurrentApp = this.props.currentAppId === app._id;
        let checked = isCurrentApp;

        let className = classNames(
            'clearfix',
            'border-bottom',
            'job-application',
            {'active': isCurrentApp}
        );

        return (
            <div className={className}>
                <div className="pull-left" style={styles.checkbox}>
                    <JobCandidateCheckBox
                        applicationId={app._id}
                        onCheck={this.handleCheckApp}
                        onUncheck={this.handleUncheckApp}
                        checked={checked}/>
                </div>
                <div className="pull-left border-left" style={styles.content} onClick={this.handleClickApp}>
                    <div className="clearfix">
                        <span className="pull-right text-muted small">{appliedTimeago}</span>
                        <a style={{color: '#666'}}>
                            <h4>{app.candidateInfo.fullname}</h4>
                        </a>
                    </div>
                    <p>{app.shortCoverLetter()}</p>
                    <div className="clearfix">
                        <div className="pull-left text-muted">
                            <i className="fa fa-map-marker"/>&nbsp;
                            Ho Chi Minh
                        </div>

                        <span className="label label-primary pull-right">
                            {app.matchingScore}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
})