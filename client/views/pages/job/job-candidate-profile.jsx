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
            isSendingMessage: false
        };
    },

    getMeteorData() {
        console.log('this.props.applicationId', this.props.applicationId);
        //this.props.applicationId = this.props.applicationId || '';

        let sub = Meteor.subscribe('application', this.props.applicationId);
        let app = Meteor.applications.findOne({_id: this.props.applicationId});
        let can = app ? Meteor.candidates.findOne({_id: app.candidateId}) : null;
        let resume = can && can.resumeId ? Collections.Resumes.findOne({resumeId: app.resumeId}) : null;
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

    handleResize() {
        let el = this.refs.container.getDOMNode();
        if ($(el).width() != this.state.width) {
            this.setState({
                width: $(el).width()
            });
        }
    },

    handleToggleAddComment(status) {
        let state = {};
        if (status === undefined) {
            status = !this.state.isAddingComment;
        }
        state['isAddingComment'] = status;

        if (status && this.state.isSendingMessage) {
            state['isSendingMessage'] = false;
        }
        this.setState(state);
    },

    handleToggleSendMessage(status) {
        let state = {};
        if (status === undefined) {
            status = !this.state.isSendingMessage;
        }
        state['isSendingMessage'] = status;

        if (status && this.state.isAddingComment) {
            state['isAddingComment'] = false;
        }
        this.setState(state);
    },

    handleSaveComment(text) {
        console.log('text', text);
        Meteor.call('addCommentApplication', {
            application: this.props.applicationId,
            content: text
        }, () => {
            this.handleDiscardComment();
        });
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
                            onToggleAddComment={this.handleToggleAddComment}
                            onToggleSendMessage={this.handleToggleSendMessage}

                        />

                        <JobCandidateProfileContent
                            job={this.props.job}
                            stage={this.props.stage}
                            application={this.data.application}
                            candidate={this.data.candidate}
                            resume={this.data.resume}
                            isAddingComment={this.state.isAddingComment}
                            isSendingMessage={this.state.isSendingMessage}
                            onToggleAddComment={this.handleToggleAddComment}
                            onToggleSendMessage={this.handleToggleSendMessage}
                            onSaveComment={this.handleSaveComment}
                            onDiscardComment={this.handleDiscardComment}
                            onDiscardMessage={this.handleDiscardMessage}
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