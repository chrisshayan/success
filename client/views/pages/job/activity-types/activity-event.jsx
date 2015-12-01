const ActivityItemEvent = Astro.Class({
    name: 'ActivityItemEvent',
    fields: {
        interviewers: {
            type: 'array',
            default() {
                return [];
            }
        },

        location: {
            type: 'string',
            default() {
                return '';
            }
        },

        scheduleDate: {
            type: 'date',
            default() {
                return new Date();
            }
        },
        startTime: {
            type: 'date',
            default() {
                return new Date();
            }
        },
        endTime: {
            type: 'date',
            default() {
                return new Date();
            }
        },
        subject: {
            type: 'string',
            default() {
                return '';
            }
        },
        body: {
            type: 'string',
            default() {
                return '';
            }
        }
    },

    methods: {
        time() {
            const start = moment(this.startTime);
            const end = moment(this.endTime);
            return start.format('MMMM Do YYYY, h:mma') + ' - ' + end.format('h:mma');
        }
    }
});

ActivityEvent = React.createClass({
    propTypes: {
        creator: React.PropTypes.object.isRequired,
        activity: React.PropTypes.object.isRequired,
    },

    getInitialState() {
        return {
            hasMore: false,
            more: false
        }
    },

    componentDidMount() {
        const body = this.refs.body.getDOMNode();
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
        const content = new ActivityItemEvent(activity.content);
        const styles = {
            body: {
                height: this.state.hasMore && !this.state.more ? '100px' : 'auto',
                overflow: 'hidden'
            },

            interviewers: {
                margin: '5px 0'
            }
        };

        let interviewers = null;
        if(content.interviewers.length > 0) {
            interviewers = <div style={ styles.interviewers }>{content.interviewers.map((userId, key) => <ActivityEventAttendee key={key} userId={userId} />) }</div>;
        } else {
            interviewers = <p className="form-control-static"><span className="text-muted">There is no interviewers</span></p>
        }

        return (
            <div className="social-feed-box activity event">
                <div className="social-avatar">
                    <a href="" className="pull-left avatar-box">
                        <Avatar upload={false} userId={this.props.creator._id} width={32} height={32}/>
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
                        <div className="row">
                            <div className="col-md-2 text-center" style={{ paddingTop: '40px' }}>
                                <i className="fa fa-calendar" style={{fontSize: '45px'}}></i>
                            </div>

                            <div className="col-md-10 border-left">
                                <div className="form-horizontal">

                                    <div className="form-group">
                                        <label className="col-sm-2 control-label">Subject</label>

                                        <div className="col-sm-10">
                                            <p className="form-control-static">{content.subject}</p>

                                        </div>
                                    </div>

                                    <p className="hr-line-dashed"/>

                                    <div className="form-group">
                                        <label className="col-sm-2 control-label">Location</label>

                                        <div className="col-sm-10">
                                            <p className="form-control-static">{content.location}</p>
                                        </div>
                                    </div>

                                    <p className="hr-line-dashed"/>

                                    <div className="form-group">
                                        <label className="col-sm-2 control-label">Time</label>

                                        <div className="col-sm-10">
                                            <p className="form-control-static">{content.time()}</p>
                                        </div>
                                    </div>

                                    <p className="hr-line-dashed"/>

                                    <div className="form-group">
                                        <label className="col-sm-2 control-label">Body</label>

                                        <div className="col-sm-10" ref="body">
                                            <div style={styles.body}>
                                                <p dangerouslySetInnerHTML={ {__html: content.body} } />
                                            </div>

                                            <div className="text-right">
                                                {this.state.hasMore ? (
                                                    <a onClick={this.handle__MoreLess}>{this.state.more ? 'less': 'more'}</a>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="hr-line-dashed"/>

                                    <div className="form-group">
                                        <label className="col-sm-2 control-label">Interviewers</label>

                                        <div className="col-sm-10">
                                            {interviewers}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});


ActivityEventAttendee = React.createClass({
    mixins: [ReactMeteorData],

    propsType: {
        userId: React.PropTypes.string.isRequired
    },

    getMeteorData() {
        return {
            user: Meteor.users.findOne({_id: this.props.userId})
        }
    },

    name() {
        return this.data.user ? this.data.user.fullname() : '';
    },

    render() {
        const styles  = {
            container: {
                marginBottom: '5px'
            },
            avatar: {

            },
            name: {
                lineHeight: '30px',
                marginLeft: '5px'
            }
        };
        return (
            <div className="clearfix" style={ styles.container }>
                <div className="pull-left" style={ styles.avatar }>
                    <Avatar userId={this.props.userId} width={32} height={32} />
                </div>
                <div className="pull-left" style={ styles.name }>
                    <span>{this.name()}</span>
                </div>
            </div>
        );
    }
});