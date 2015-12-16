JobCandidateActionBox = React.createClass({
    propTypes: {
        appId: React.PropTypes.number.isRequired,
        action: React.PropTypes.string.isRequired
    },

    render() {
        let content = null;
        switch (this.props.action) {
            case 'comment':
                content = <CommentBox
                            actions={this.props.actions}
                            appId={ this.props.appId }
                            onDiscard={this.props.actions.discardActionBox}
                            onSave={this.props.actions.saveComment } />;
                break;
            case 'message':
                content = <MessageBox
                            actions={this.props.actions}
                            appIds={ [this.props.appId] }
                            onSave={ this.props.actions.sendMessage }
                            onDiscard={this.props.actions.discardActionBox} />;
                break;

            case 'scheduleInterview':
                content = <ScheduleEvent
                                actions={this.props.actions}
                                appId={ this.props.appId }
                                onSave={ this.props.actions.scheduleInterview }
                                onDiscard={this.props.actions.discardActionBox}/>;
                break;

            case 'scoreCandidate':
                content = <ScoreCardForm
                                actions={this.props.actions}
                                extra={ this.props.extra }
                                jobId={ this.props.jobId }
                                appId={ this.props.appId }
                                onSave={ this.props.actions.submitScorecard }
                                onDiscard={this.props.actions.discardActionBox}/>;
                break;
        }
        return content;
    }
});