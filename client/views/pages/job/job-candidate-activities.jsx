JobCandidateTimeline = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        application: React.PropTypes.object.isRequired,
        candidate: React.PropTypes.object.isRequired
    },

    getInitialState() {
        return {
            appId: this.props.application ? this.props.application._id : null,
            inc: 10,
            limit: 10
        };
    },

    getMeteorData() {
        let subData = [this.filter(), this.option()];
        let sub = Meteor.subscribe('applicationActivities', ...subData);
        return {
            isReady: sub.ready(),
            activities: Collections.Activities.find(...subData).fetch()
        };
    },

    filter() {
        return {
            "data.applicationId": this.state.appId
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
        return Collections.Activities.find(this.filter()).count() > this.state.limit;
    },

    render() {
        let loadmore = null;
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
        let action = null;

        if(this.props.isAddingComment) {
            action = <CommentBox onSave={this.props.onSaveComment} onDiscard={this.props.onDiscardComment} />
        } else if(this.props.isSendingMessage) {
            let candidateInfo = this.props.application['candidateInfo'] || null;
            if(candidateInfo) {
                let to = {
                    appIds: [this.props.application._id],
                    emails: [candidateInfo.emails[0]]
                };
                action = <MessageBox onDiscard={this.props.onDiscardMessage} to={to} />
            }
        } else if(this.props.isScheduleInterview) {
            action = <ScheduleEvent />
        }
        return (
            <div className="feed-activity-list">
                {action}
                {this.data.activities.map((activity, key) => {
                    return <CandidateActivityItem
                        activity={activity}
                        application={this.props.application}
                        candidate={this.props.candidate} key={key}/>
                    } )}

                {loadmore}
            </div>

        );
    }
});


CandidateActivityItem = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        activity: React.PropTypes.object.isRequired,
        candidate: React.PropTypes.object.isRequired,
    },

    getInitialState() {
        return {
            type: null
        };
    },

    getMeteorData() {
        let creator = null;
        if (this.props.activity['createdBy']) {
            creator = Meteor.users.findOne({_id: this.props.activity['createdBy']});
        }
        return {
            creator: creator
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
        switch (this.state.type) {
            case 1: // moved app state
                content = <ActivityType1
                    activity={this.props.activity}
                    application={this.props.application}
                    candidate={this.props.candidate}
                    creator={this.data.creator}/>
                break;
            case 2: // applied job
                content = <ActivityType2
                    activity={this.props.activity}
                    application={this.props.application}
                    candidate={this.props.candidate}/>
                break;

            case 3: // disqualified app
                content = <ActivityType3
                    activity={this.props.activity}
                    creator={this.data.creator}/>

                break;

            case 4: // revert qualify app
                content = <ActivityType4
                    activity={this.props.activity}
                    creator={this.data.creator}/>

                break;

            case 5:  // sent mail
                content = <ActivityType5
                    activity={this.props.activity}
                    creator={this.data.creator}/>
                break;
            case 6:  // added comment
                content = <ActivityType6
                    activity={this.props.activity}
                    creator={this.data.creator}/>

                break;
            case 7:  // added candidate to source

                break;
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
        return $.cloudinary.url(publicId, opt)
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
                backgroundRepeat: 'no-repeat'
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


ActivityMixin = {};

var ActivityType1 = React.createClass({
    propTypes: {
        activity: React.PropTypes.object.isRequired,
        application: React.PropTypes.object.isRequired,
        candidate: React.PropTypes.object.isRequired,
        creator: React.PropTypes.object.isRequired,
    },

    image() {
        let data = this.props.creator && this.props.creator['profile'] ? this.props.creator.profile : null;
        if (data['avatar']) return {publicId: data['avatar']};
        return data['firstname'] ? {firstName: data['firstname']} : null;
    },

    fullName() {
        let data = this.props.creator && this.props.creator['profile'] ? this.props.creator.profile : null;
        if (!data) return '';
        return [data['firstname'], data['lastname']].join(' ')
    },

    timeago() {
        let d = moment(this.props.activity.createdAt);
        let distance = Math.ceil((Date.now() - d.valueOf()) / 1000) / 60;
        if (distance >= 30)
            return d.format('MMMM Do YYYY, h:mm:ss a');
        return d.fromNow();
    },

    icon() {
        let ic = ['fa'],
            data = this.props.activity.data;
        if (!data) return '';

        if (data.fromStage > data.toStage) {
            ic.push('fa-long-arrow-left');
        } else {
            ic.push('fa-long-arrow-right');
        }
        return ic.join(' ');
    },

    message() {
        let data = this.props.activity.data;
        if (!data) return '';
        let from = Success.APPLICATION_STAGES[data.fromStage];
        let to = Success.APPLICATION_STAGES[data.toStage];
        return `Moved from <b>${from.label}</b> to <b>${to.label}</b>`;
    },

    render() {
        return (
            <div className="social-feed-box">
                <div className="social-avatar">
                    <a href="" className="pull-left">
                        <SocialAvatar image={this.image()} style={{marginRight: '10px'}}/>
                    </a>

                    <div className="media-body">
                        <a href="#">
                            {this.fullName()}
                        </a>
                        <small className="text-muted">{this.timeago()}</small>
                    </div>
                </div>
                <div className="social-body">
                    <div className="activity-info">
                        <i className={this.icon()}/>
                        <p className="msg" dangerouslySetInnerHTML={{__html: this.message()}}/>
                    </div>
                </div>
            </div>
        );
    }
});


var ActivityType2 = React.createClass({
    propTypes: {
        activity: React.PropTypes.object.isRequired,
        candidate: React.PropTypes.object.isRequired,
        application: React.PropTypes.object.isRequired,
    },

    firstName() {
        let data = this.props.candidate && this.props.candidate['data'] ? this.props.candidate.data : null;
        if (!data) return '';
        return data['firstname'] ? data['firstname'] : '';
    },

    fullName() {
        let data = this.props.candidate && this.props.candidate['data'] ? this.props.candidate.data : null;
        if (!data) return '';
        return [data['firstname'], data['lastname']].join(' ')
    },

    timeago() {
        let d = moment(this.props.activity.createdAt);
        let distance = Math.ceil((Date.now() - d.valueOf()) / 1000) / 60;
        if (distance >= 30)
            return d.format('MMMM Do YYYY, h:mm:ss a');
        return d.fromNow();
    },

    render() {
        return (
            <div className="social-feed-box">
                <div className="social-avatar">
                    <a href="" className="pull-left">
                        <SocialAvatar image={{firstName: this.firstName()}} style={{marginRight: '10px'}}/>
                    </a>

                    <div className="media-body">
                        <a href="#">
                            {this.fullName()}
                        </a>
                        <small className="text-muted">{this.timeago()}</small>
                    </div>
                </div>

                <div className="social-body">
                    <div className="activity-info">
                        <i className="fa fa-file-text-o"/>
                        <strong className="msg">Applied this position</strong>
                    </div>
                </div>
            </div>
        );
    }
});

var ActivityType3 = React.createClass({
    propTypes: {
        activity: React.PropTypes.object.isRequired,
        creator: React.PropTypes.object.isRequired,
    },

    image() {
        let data = this.props.creator && this.props.creator['profile'] ? this.props.creator.profile : null;
        if (data['avatar']) return {publicId: data['avatar']};
        return data['firstname'] ? {firstName: data['firstname']} : null;
    },

    fullName() {
        let data = this.props.creator && this.props.creator['profile'] ? this.props.creator.profile : null;
        if (!data) return '';
        return [data['firstname'], data['lastname']].join(' ')
    },

    timeago() {
        let d = moment(this.props.activity.createdAt);
        let distance = Math.ceil((Date.now() - d.valueOf()) / 1000) / 60;
        if (distance >= 30)
            return d.format('MMMM Do YYYY, h:mm:ss a');
        return d.fromNow();
    },

    icon() {
        return ['fa', 'fa-thumbs-down'].join(' ');
    },

    message() {
        return 'Disqualified';
    },

    render() {
        return (
            <div className="social-feed-box">
                <div className="social-avatar">
                    <a href="" className="pull-left">
                        <SocialAvatar image={this.image()} style={{marginRight: '10px'}}/>
                    </a>

                    <div className="media-body">
                        <a href="#">
                            {this.fullName()}
                        </a>
                        <small className="text-muted">{this.timeago()}</small>
                    </div>
                </div>
                <div className="social-body">
                    <div className="activity-info">
                        <i className={this.icon()}/>
                        <p className="msg" dangerouslySetInnerHTML={{__html: this.message()}}/>
                    </div>
                </div>
            </div>
        );
    }
});


var ActivityType4 = React.createClass({
    propTypes: {
        activity: React.PropTypes.object.isRequired,
        creator: React.PropTypes.object.isRequired,
    },

    image() {
        let data = this.props.creator && this.props.creator['profile'] ? this.props.creator.profile : null;
        if (data['avatar']) return {publicId: data['avatar']};
        return data['firstname'] ? {firstName: data['firstname']} : null;
    },

    fullName() {
        let data = this.props.creator && this.props.creator['profile'] ? this.props.creator.profile : null;
        if (!data) return '';
        return [data['firstname'], data['lastname']].join(' ')
    },

    timeago() {
        let d = moment(this.props.activity.createdAt);
        let distance = Math.ceil((Date.now() - d.valueOf()) / 1000) / 60;
        if (distance >= 30)
            return d.format('MMMM Do YYYY, h:mm:ss a');
        return d.fromNow();
    },

    icon() {
        return ['fa', 'fa-thumbs-up'].join(' ');
    },

    message() {
        return 'Revert qualify';
    },

    render() {
        return (
            <div className="social-feed-box">
                <div className="social-avatar">
                    <a href="" className="pull-left">
                        <SocialAvatar image={this.image()} style={{marginRight: '10px'}}/>
                    </a>

                    <div className="media-body">
                        <a href="#">
                            {this.fullName()}
                        </a>
                        <small className="text-muted">{this.timeago()}</small>
                    </div>
                </div>
                <div className="social-body">
                    <div className="activity-info">
                        <i className={this.icon()}/>
                        <p className="msg" dangerouslySetInnerHTML={{__html: this.message()}}/>
                    </div>
                </div>
            </div>
        );
    }
});


var ActivityType5 = React.createClass({
    propTypes: {
        activity: React.PropTypes.object.isRequired,
        creator: React.PropTypes.object.isRequired,
    },

    getInitialState() {
        return {
            isShowMore: false
        };

    },

    image() {
        let data = this.props.creator && this.props.creator['profile'] ? this.props.creator.profile : null;
        if (data['avatar']) return {publicId: data['avatar']};
        return data['firstname'] ? {firstName: data['firstname']} : null;
    },

    fullName() {
        let data = this.props.creator && this.props.creator['profile'] ? this.props.creator.profile : null;
        if (!data) return '';
        return [data['firstname'], data['lastname']].join(' ')
    },

    timeago() {
        let d = moment(this.props.activity.createdAt);
        let distance = Math.ceil((Date.now() - d.valueOf()) / 1000) / 60;
        if (distance >= 30)
            return d.format('MMMM Do YYYY, h:mm:ss a');
        return d.fromNow();
    },


    message() {
        let data = this.props.activity['data'] || null;
        return data.html;
    },

    render() {
        let styles = {
            content: {
                overflow: 'hidden',
                height: this.state.isShowMore ? 'auto' : '115px'
            }
        };
        let moreLessBtn = null;
        if(this.state.isShowMore) {
            moreLessBtn = (
                <button
                    className="btn btn-link"
                    onClick={() => this.setState({isShowMore: false}) }>
                    less
                </button>
            );
        } else {
            moreLessBtn = (
                <button
                    className="btn btn-link"
                    onClick={() => this.setState({isShowMore: true}) }>
                    more
                </button>
            );
        }

        return (
            <div className="social-feed-box">
                <div className="social-avatar">
                    <a href="" className="pull-left">
                        <SocialAvatar image={this.image()} style={{marginRight: '10px'}}/>
                    </a>

                    <div className="media-body">
                        <div className="clearfix">
                            <a href="#" className="pull-left">
                                {this.fullName()}
                            </a>
                            <small className="pull-left text-muted" style={{margin: '0 5px', lineHeight: '20px'}}>sent message to candidate</small>
                        </div>
                        <small className="text-muted">{this.timeago()}</small>
                    </div>
                </div>
                <div className="social-body" style={styles.content}>
                    <p dangerouslySetInnerHTML={{__html: this.message()}} />
                </div>
                <div className="text-right">
                    {moreLessBtn}
                </div>
            </div>
        );
    }
});


var ActivityType6 = React.createClass({
    propTypes: {
        activity: React.PropTypes.object.isRequired,
        creator: React.PropTypes.object.isRequired,
    },

    image() {
        let data = this.props.creator && this.props.creator['profile'] ? this.props.creator.profile : null;
        if (data['avatar']) return {publicId: data['avatar']};
        return data['firstname'] ? {firstName: data['firstname']} : null;
    },

    fullName() {
        let data = this.props.creator && this.props.creator['profile'] ? this.props.creator.profile : null;
        if (!data) return '';
        return [data['firstname'], data['lastname']].join(' ')
    },

    timeago() {
        let d = moment(this.props.activity.createdAt);
        let distance = Math.ceil((Date.now() - d.valueOf()) / 1000) / 60;
        if (distance >= 30)
            return d.format('MMMM Do YYYY, h:mm:ss a');
        return d.fromNow();
    },


    message() {
        let data = this.props.activity['data'] || null;
        let content = data['content'] || '';
        return content.replace(/(\n|\r\n)/g, '<br/>');
    },

    render() {
        return (
            <div className="social-feed-box">
                <div className="social-avatar">
                    <a href="" className="pull-left">
                        <SocialAvatar image={this.image()} style={{marginRight: '10px'}}/>
                    </a>

                    <div className="media-body">
                        <div className="clearfix">
                            <a href="#" className="pull-left">
                                {this.fullName()}
                            </a>
                            <small className="pull-left text-muted" style={{margin: '0 5px', lineHeight: '20px'}}>added comment</small>
                        </div>
                        <small className="text-muted">{this.timeago()}</small>
                    </div>
                </div>
                <div className="social-body">
                    <p dangerouslySetInnerHTML={{__html: this.message()}} />
                </div>
            </div>
        );
    }
});



var ActivityTypeN = React.createClass({
    propTypes: {
        data: React.PropTypes.object.isRequired
    },
    render() {
        return (
            <div className="social-feed-box">

                <div className="pull-right social-action dropdown">
                    <button data-toggle="dropdown" className="dropdown-toggle btn-white">
                        <i className="fa fa-angle-down"></i>
                    </button>
                    <ul className="dropdown-menu m-t-xs">
                        <li><a href="#">Edit</a></li>
                        <li><a href="#">Delete</a></li>
                    </ul>
                </div>
                <div className="social-avatar">
                    <a href="" className="pull-left">
                        <img alt="image" src="/img/a1.jpg"/>
                    </a>
                    <div className="media-body">
                        <a href="#">
                            Andrew Williams
                        </a>
                        <small className="text-muted">Today 4:21 pm - 12.06.2014</small>
                    </div>
                </div>
                <div className="social-body">
                    <p>
                        Many desktop publishing packages and web page editors now use Lorem Ipsum as their
                        default model text, and a search for 'lorem ipsum' will uncover many web sites still
                        in their infancy. Packages and web page editors now use Lorem Ipsum as their
                        default model text.
                    </p>

                    <div className="btn-group">
                        <button className="btn btn-white btn-xs"><i className="fa fa-thumbs-up"></i> Like this!
                        </button>
                        <button className="btn btn-white btn-xs"><i className="fa fa-comments"></i> Comment</button>
                        <button className="btn btn-white btn-xs"><i className="fa fa-share"></i> Share</button>
                    </div>
                </div>
                <div className="social-footer">
                    <div className="social-comment">
                        <a href="" className="pull-left">
                            <img alt="image" src="/img/a1.jpg"/>
                        </a>
                        <div className="media-body">
                            <a href="#">
                                Andrew Williams
                            </a>
                            Internet tend to repeat predefined chunks as necessary, making this the first true
                            generator on the Internet. It uses a dictionary of over 200 Latin words.
                            <br/>
                            <a href="#" className="small"><i className="fa fa-thumbs-up"></i> 26 Like this!</a> -
                            <small className="text-muted">12.06.2014</small>
                        </div>
                    </div>

                    <div className="social-comment">
                        <a href="" className="pull-left">
                            <img alt="image" src="/img/a2.jpg"/>
                        </a>
                        <div className="media-body">
                            <a href="#">
                                Andrew Williams
                            </a>
                            Making this the first true generator on the Internet. It uses a dictionary of.
                            <br/>
                            <a href="#" className="small">
                                <i className="fa fa-thumbs-up"></i> 11 Like this!
                            </a> -
                            <small className="text-muted">10.07.2014</small>

                        </div>
                    </div>

                    <div className="social-comment">
                        <a href="" className="pull-left">
                            <img alt="image" src="/img/a3.jpg"/>
                        </a>
                        <div className="media-body">
                            <textarea className="form-control" placeholder="Write comment..."></textarea>
                        </div>
                    </div>

                </div>

            </div>
        );
    }
});

