ActivityMessage = React.createClass({
    propTypes: {
        creator: React.PropTypes.object.isRequired,
        activity: React.PropTypes.object.isRequired
    },

    getInitialState() {
        return {
            hasMore: false,
            more: false
        }
    },

    componentDidMount() {
        const body = this.refs.body();
        if(body.offsetHeight > 120) {
            this.setState({
                hasMore: true,
                more: false
            });
        }
    },

    handle__MoreLess(e) {
        e.preventDefault();
        this.setState({more: !this.state.more});
    },

    render() {
        const activity = this.props.activity;
        const styles = {
            body: {
                height: this.state.hasMore && !this.state.more ? '100px' : 'auto',
                overflow: 'hidden',
                margin: '5px 0'
            }
        };
        return (
            <div className="social-feed-box">
                <div className="social-avatar">
                    <a href="" className="pull-left avatar-box">
                        <Avatar upload={false} userId={this.props.creator._id} width={32} height={32}  />
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
                        <div ref="body" style={ styles.body }>
                            <div dangerouslySetInnerHTML={ {__html: activity.body()} }/>
                        </div>

                        <div className="text-right">
                            {this.state.hasMore ? (
                                <a onClick={this.handle__MoreLess}>{this.state.more ? 'less': 'more'}</a>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});