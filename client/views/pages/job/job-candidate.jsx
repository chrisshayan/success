JobCandidate = React.createClass({
    /**
     * change query param when click on application
     * @param e <Event>
     */
        handle__ClickApp(e) {
        e.preventDefault();
        const params = Router.current().params;
        const query = _.omit(params.query, 'appAction');
        query['appId'] = this.props.appId;

        Router.go('Job', params, {query});
        $('body').animate({
            scrollTop: 0
        }, 300);
    },

    /**
     * select application for bulk actions
     */
        handle__CheckApp() {
        this.props.actions.toggleCheck(this.props.appId, true);
    },

    handle__UncheckApp() {
        this.props.actions.toggleCheck(this.props.appId, false);
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

        let appliedTimeago = moment(app.appliedDate.toISOString()).fromNow();
        let isCurrentApp = this.props.currentAppId === app.appId;

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
                        onCheck={this.handle__CheckApp}
                        onUncheck={this.handle__UncheckApp}
                        checked={this.props.checked}/>
                </div>
                <div className="pull-left border-left" style={styles.content} onClick={this.handle__ClickApp}>
                    <div className="clearfix">
                        <span className="pull-right text-muted small">{appliedTimeago}</span>
                        <a style={{color: '#666'}}>
                            <h4>{app.fullname}</h4>
                        </a>
                    </div>
                    <p>{app.shortCoverLetter()}</p>

                    <div className="clearfix">
                        <div className="pull-left text-muted">
                            <i className="fa fa-map-marker"/>&nbsp;
                            { app.cityName }
                        </div>

                        { this.render__MatchingScore() }
                    </div>
                </div>
            </div>
        );
    },

    render__MatchingScore() {
        const app = this.props.app;
        const score = app && app['matchingScore'] ? app['matchingScore'] : 0;
        if (score <= 0) return null;
        let labelClass = '';

        if (score > 80) {
            labelClass = 'label-primary';
        } else if (score > 60) {
            labelClass = 'label-info';
        } else if (score > 40) {
            labelClass = 'label-success';
        } else if (score > 20) {
            labelClass = 'label-warning';
        } else if (score > 0) {
            labelClass = 'label-danger';
        }

        const cx = classNames('label', 'pull-right', labelClass);
        return (
            <span className={cx}>
                {score}
            </span>
        );
    }
})