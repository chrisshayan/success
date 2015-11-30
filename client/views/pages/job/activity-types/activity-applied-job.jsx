ActivityAppliedJob = React.createClass({
    propTypes: {
        activity: React.PropTypes.object.isRequired,
    },
    render() {
        const activity = this.props.activity;
        return (
            <div className="social-feed-box">
                <div className="social-avatar">
                    <a href="" className="pull-left">
                        <SocialAvatar image={{name: 'firstName'}}/>
                    </a>

                    <div className="media-body">
                        <a href="#">
                            <span>{ ' ' }</span>&nbsp;
                            <span className="text-muted small">{ activity.title() }</span>
                        </a>
                        <small className="text-muted">{ activity.timeago() }</small >
                    </div>
                </div>

                <div className="social-body">
                    <div className="activity-info">
                        { activity.body() }
                    </div>
                </div>
            </div>
        );
    }
});