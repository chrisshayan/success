JobCandidates = React.createClass({
    propTypes: {
        job: React.PropTypes.object,
        stage: React.PropTypes.object,
        applications: React.PropTypes.array.isRequired
    },

    componentDidMount() {
	    const $window = $(window);
	    const $list = $(this.refs.list);
	    console.log($window.height() - 200 - 115)

	    $list.slimScroll({
		    height: $window.height() - 115 - 200
	    });
    },

    render() {

        return (
            <div ref="list">
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