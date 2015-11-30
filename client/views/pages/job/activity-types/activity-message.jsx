ActivityMessage = React.createClass({
    propTypes: {
        creator: React.PropTypes.object.isRequired,
        activity: React.PropTypes.object.isRequired
    },
    render() {
        const activity = this.props.activity;
        return (
            <div className="social-feed-box">
                <div className="social-avatar">
                    <a href="" className="pull-left">
                        <SocialAvatar image={{name: 'firstName'}}/>
                        &nbsp;
                    </a>

                    <div className="media-body">
                        <a href="#">
                            <span>{ this.props.creator.fullname() }</span>&nbsp;
                            <span className="text-muted small">{ activity.title() }</span>
                        </a>
                        <small className="text-muted">{ activity.timeago() }</small >
                    </div>
                </div>

                <div className="social-body">
                    <div className="activity-info">
                        <div dangerouslySetInnerHTML={ {__html: activity.body()} }/>
                    </div>
                </div>
            </div>
        );
    }
});