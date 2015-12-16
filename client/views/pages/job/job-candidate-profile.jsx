JobCandidateProfile = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        job: React.PropTypes.object.isRequired,
        stage: React.PropTypes.object.isRequired,
        applicationId: React.PropTypes.number,
        tabState: React.PropTypes.number
    },

    getInitialState() {
        return {
            width: 880,
            isAddingComment: false,
            isSendingMessage: false,
            isScheduleInterview: false
        };
    },

    getMeteorData() {
        let sub = Meteor.subscribe('application', this.props.applicationId);
        let app = Application.getCollection().findOne({appId: this.props.applicationId});
        return {
            isReady: sub.ready(),
            application: app
        };
    },

    componentDidMount() {
        let el = this.refs.container.getDOMNode();
        this.resize();
        $(el).bind('resize', this.resize);
        window.addEventListener('resize', this.resize);
    },

    componentWillUnmount: function () {
        let el = this.refs.container.getDOMNode();
        $(el).unbind('resize', this.resize);
        window.removeEventListener('resize', this.resize);
    },

    componentWillUpdate(nextProps, nextState) {
        if (this.props.applicationId != nextProps.applicationId) {
            this.setState({
                isAddingComment: false,
                isSendingMessage: false,
                isScheduleInterview: false
            });
        }
    },

    componentDidUpdate() {
        if(this.data.application) {
            this.props.actions.changeCurrentAppType(this.data.application.type);
        }
    },

    handleToggleAddComment(status) {
        let state = {};
        if (status === undefined) {
            status = !this.state.isAddingComment;
        }
        state['isAddingComment'] = status;

        if (status) {
            state['isSendingMessage'] = false;
            state['isScheduleInterview'] = false;
        }
        this.setState(state);
    },

    handleToggleSendMessage(status) {
        let state = {};
        if (status === undefined) {
            status = !this.state.isSendingMessage;
        }
        state['isSendingMessage'] = status;

        if (status) {
            state['isAddingComment'] = false;
            state['isScheduleInterview'] = false;
        }
        this.setState(state);
    },

    handleToggleScheduleInterview(status) {
        let state = {};
        if (status === undefined) {
            status = !this.state.isScheduleInterview;
        }
        state['isScheduleInterview'] = status;

        if (status) {
            state['isAddingComment'] = false;
            state['isSendingMessage'] = false;
        }
        this.setState(state);
    },

    handleSaveComment(text) {
        Meteor.call('addCommentApplication', {
            application: this.props.applicationId,
            content: text
        }, () => {
            this.handleDiscardComment();
        });
    },

    handleSaveScheduleInterview(event) {
        Meteor.call('scheduleInterview', this.props.job._id, this.props.applicationId, event, (err, result) => {
            if (!err)
                swal("Scheduled interview successfully!", "", "success");
        });
        this.handleDiscardScheduleInterview();
    },

    handleDiscardComment() {
        $('body').animate({
            scrollTop: 0
        }, 'fast');

        this.handleToggleAddComment(false);
    },

    handleDiscardComment() {
        $('body').animate({
            scrollTop: 0
        }, 'slow');

        this.handleToggleAddComment(false);
    },

    handleDiscardMessage() {
        $('body').animate({
            scrollTop: 0
        }, 'slow');

        this.handleToggleSendMessage(false);
    },

    handleDiscardScheduleInterview() {
        $('body').animate({
            scrollTop: 0
        }, 'slow');

        this.handleToggleScheduleInterview(false);
    },

    resize: function () {
        if (this.refs.container) {
            const width = this.refs.container.getDOMNode().offsetWidth;
            if (this.state.width != width) {
                this.setState({width});
            }
        }
    },

    render() {
        let content = null;
        if (this.data.isReady) {
            if (this.data.application) {
                content = (

                    <div className="content">
                        <JobCandidateProfileActions
                            {...this.props}
                            containerWidth={this.state.width}
                            application={this.data.application}/>

                        <JobCandidateProfileContent
                            {...this.props}
                            application={this.data.application}/>
                    </div>
                );
            } else {
                content = (
                    <div className="no-application">
                        <i className="fa fa-sticky-note-o"/>
                        <h1>No application selected</h1>
                    </div>
                );
            }
        } else {
            content = <WaveLoading />
        }

        return (
            <div className="job-candidate-profile" ref={'container'}>
                {content}
            </div>
        );
    }
});
