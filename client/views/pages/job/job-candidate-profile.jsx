JobCandidateProfile = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        job: React.PropTypes.object.isRequired,
        stage: React.PropTypes.object.isRequired,
        applicationId: React.PropTypes.string
    },

    getInitialState() {
        return {
            width: 800,
            isAddingComment: false,
            isSendingMessage: false,
            isScheduleInterview: false
        };
    },

    getMeteorData() {
        let sub = Meteor.subscribe('application', this.props.applicationId);
        let app = Collections.Applications.findOne({_id: this.props.applicationId});
        let can = app ? Collections.Candidates.findOne({candidateId: app.candidateId}) : null;
        let resume = can ? Collections.Resumes.findOne({resumeId: app.data.resumeid}) : null;
        return {
            isReady: sub.ready(),
            application: app,
            candidate: can,
            resume: resume
        };
    },

    componentDidMount() {
        let el = this.refs.container.getDOMNode();
        $(el).bind('resize', this.handleResize);
        window.addEventListener('resize', this.handleResize);
    },

    componentWillUnmount: function () {
        let el = this.refs.container.getDOMNode();
        $(el).unbind('resize', this.handleResize);
        window.removeEventListener('resize', this.handleResize);
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

    handleResize() {
        /*let el = this.refs.container.getDOMNode();

         if($(el).width() != this.state.width) {
         this.setState({
         width: $(el).width()
         });
         }
         */
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

    render() {
        let content = null;
        if (this.data.isReady) {
            if (this.data.application) {
                content = (
                    <div className="content">
                        <JobCandidateProfileActions
                            job={this.props.job}
                            stage={this.props.stage}
                            application={this.data.application}
                            candidate={this.data.candidate}
                            containerWidth={this.state.width}
                            isAddingComment={this.state.isAddingComment}
                            isSendingMessage={this.state.isSendingMessage}
                            isScheduleInterview={this.state.isScheduleInterview}
                            onToggleAddComment={this.handleToggleAddComment}
                            onToggleSendMessage={this.handleToggleSendMessage}
                            onToggleScheduleInterview={this.handleToggleScheduleInterview}
                        />

                        <JobCandidateProfileContent
                            job={this.props.job}
                            stage={this.props.stage}
                            application={this.data.application}
                            candidate={this.data.candidate}
                            resume={this.data.resume}
                            isAddingComment={this.state.isAddingComment}
                            isSendingMessage={this.state.isSendingMessage}
                            isScheduleInterview={this.state.isScheduleInterview}
                            onToggleAddComment={this.handleToggleAddComment}
                            onToggleSendMessage={this.handleToggleSendMessage}
                            onToggleScheduleInterview={this.handleToggleScheduleInterview}
                            onSaveComment={this.handleSaveComment}
                            onSaveScheduleInterview={this.handleSaveScheduleInterview}
                            onDiscardComment={this.handleDiscardComment}
                            onDiscardMessage={this.handleDiscardMessage}
                            onDiscardInterview={this.handleDiscardScheduleInterview}
                        />
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