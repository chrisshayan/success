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
                            appId={ this.props.appId }
                            onDiscard={this.props.actions.discardActionBox}
                            onSave={this.props.actions.saveComment } />;
                break;
            case 'message':
                content = <MessageBox
                            appIds={ [this.props.appId] }
                            onSave={ this.props.actions.sendMessage }
                            onDiscard={this.props.actions.discardActionBox} />;
                break;

            case 'scheduleInterview':
                content = <ScheduleEvent
                                appId={ this.props.appId }
                                onSave={ this.props.actions.scheduleInterview }
                                onDiscard={this.props.actions.discardActionBox}/>;
                break;
        }
        return content;
    }
});