JobCandidates = React.createClass({
    propTypes: {
        job: React.PropTypes.object,
        stage: React.PropTypes.object,
        applications: React.PropTypes.array.isRequired
    },

    componentDidMount() {

    },

    render() {

        return (
            <div>
                { this.props.applications.map(this.renderApp) }
            </div>
        );
    },

    renderApp(app, key) {
        return <JobCandidate
            key={ key }
            app={ app }
            stage={ this.props.stage }
            job={ this.props.job }
            checked={ this.props.actions.isChecked(app.appId) }
            actions={ this.props.actions }
            appId={ app.appId }
            appType={ app.type }
            currentAppId={ this.props.currentAppId } />;
    }
});

let {Modal} = ReactBootstrap;

BulkMessageBox = React.createClass({
    render() {
        return (
            <Modal
                onHide={this.props.onDiscard}
                bsSize='large' show={this.props.show}>
                <MailComposer to={this.props.to} onDiscard={this.props.onDiscard}/>
            </Modal>
        );
    }
});