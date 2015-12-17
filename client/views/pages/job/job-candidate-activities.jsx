const {
    APPLICATION_CREATE,
    APPLICATION_STAGE_UPDATE,
    RECRUITER_CREATE_COMMENT,
    RECRUITER_CREATE_EMAIL,
    RECRUITER_DISQUALIFIED,
    RECRUITER_REVERSE_QUALIFIED,
    RECRUITER_SCHEDULE,
    RECRUITER_SCORE_CANDIDATE
    } = Activities.TYPE;

JobCandidateTimeline = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        applicationId: React.PropTypes.number.isRequired
    },

    getInitialState() {
        return {
            appId: this.props.applicationId ? this.props.applicationId : null,
            inc: 10,
            limit: 10
        };
    },

    getMeteorData() {
        let appAction = null;
        let subData = [this.filter(), this.option()];
        let sub = Meteor.subscribe('activities', ...subData);
        let params = Router.current().params;
        if (params['query'] && params['query']['appAction']) {
            appAction = params['query']['appAction'];
        }
        return {
            isReady: sub.ready(),
            activities: Activities.find(...subData).fetch(),
            appAction: appAction
        };
    },

    filter() {
        return {
            "ref.appId": this.state.appId
        };
    },

    option() {
        return {
            limit: this.state.limit,
            sort: {
                createdAt: -1
            }
        };
    },

    handleClickMore(e) {
        e.preventDefault();
        this.setState({
            limit: this.state.limit + this.state.inc
        });
    },

    hasMore() {
        return Activities.find(this.filter()).count() > this.state.limit;
    },

    render() {
        let loadmore = null,
            action = null;
        if (this.hasMore()) {
            loadmore = (
                <button
                    className="btn btn-primary btn-block m-t"
                    onClick={this.handleClickMore}>
                    <i className="fa fa-arrow-down"/>&nbsp;
                    Show More
                </button>
            );
        }
        const actionList = ['comment', 'message', 'scheduleInterview', 'scoreCandidate'];
        if (this.data.appAction && actionList.indexOf(this.data.appAction) >= 0) {
            action = (
                <JobCandidateActionBox
                    extra={this.props.extra}
                    actions={this.props.actions}
                    action={this.data.appAction}
                    appId={this.props.applicationId}
                    application={this.props.application}/>
            );
        }

        return (
            <div className="feed-activity-list">
                {action}

                {this.data.activities.map((activity, key) => <ActivityItem key={key} activity={activity}/>)}


                {loadmore}
            </div>

        );
    }
});

ActivityItem = React.createClass({

    mixins: [ReactMeteorData],
    propTypes: {
        activity: React.PropTypes.object.isRequired
    },

    getInitialState() {
        return {
            type: null
        };
    },

    getMeteorData() {
        return {
            creator: this.props.activity.creator()
        };
    },

    componentWillMount() {
        this.setState({
            type: this.props.activity.actionType
        });
    },

    componentWillReceiveProps(nextProps) {
        this.setState({
            type: nextProps.activity.actionType
        });
    },

    render() {
        let content = null;
        if(this.data.creator && this.props.activity.type != APPLICATION_CREATE) {
            switch (this.props.activity.type) {
                case APPLICATION_STAGE_UPDATE:
                    content = <ActivityStageUpdate activity={ this.props.activity } creator={this.data.creator}/>;
                    break;

                case RECRUITER_CREATE_COMMENT:
                    content = <ActivityComment activity={ this.props.activity } creator={this.data.creator}/>;
                    break;

                case RECRUITER_CREATE_EMAIL:
                    content = <ActivityMessage activity={ this.props.activity } creator={this.data.creator}/>;
                    break;

                case RECRUITER_SCHEDULE:
                    content = <ActivityEvent activity={ this.props.activity } creator={this.data.creator}/>;
                    break;

                case RECRUITER_DISQUALIFIED:
                    content = <ActivityDisqualified activity={ this.props.activity } creator={this.data.creator}/>;
                    break;

                case RECRUITER_REVERSE_QUALIFIED:
                    content = <ActivityRevertQualify activity={ this.props.activity } creator={this.data.creator}/>;
                    break;

                case RECRUITER_SCORE_CANDIDATE:
                    break;
            }
        }
        if(this.props.activity.type == APPLICATION_CREATE) {
            content = <ActivityAppliedJob activity={ this.props.activity }/>;
        }
        return content;
    }
});


SocialAvatar = React.createClass({
    propTypes: {
        image: React.PropTypes.object.isRequired,
        style: React.PropTypes.object,
    },
    getDefaultProps() {
        return {
            style: {}
        };
    },
    getImageUrl(publicId) {
        let opt = {
            width: this.props.width || 32,
            height: this.props.height || 32
        };
        return $.cloudinary.url(publicId, opt);
    },
    render() {
        let content = null;

        let bg = null;
        if (this.props.image && this.props.image['publicId']) {
            bg = `url(${this.getImageUrl(this.props.image['publicId'])})`;
        }
        let styles = {
            container: {
                width: this.props.width ? this.props.width + 'px' : '32px',
                height: this.props.height ? this.props.height + 'px' : '32px',
                lineHeight: this.props.height ? this.props.height + 'px' : '32px',
                color: '#666',
                fontSize: '15px',
                textAlign: 'center',
                background: bg || '#ddd',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                marginRight: '5px'
            }
        };

        let mainStyle = _.merge(styles.container, this.props.style);

        if (!bg && this.props.image['firstName']) {
            content = <div style={mainStyle}>{this.props.image['firstName'][0] || ''}</div>;
        } else {
            content = <div style={mainStyle}/>;
        }


        return content;
    }
});
