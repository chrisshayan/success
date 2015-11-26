JobHiringProcess = React.createClass({
    propTypes: {
        jobId: React.PropTypes.number.isRequired,
        counter: React.PropTypes.object.isRequired,
        currentStage: React.PropTypes.object.isRequired
    },

    getInitialState() {
        return {
            stages: _.toArray(Success.APPLICATION_STAGES),
            isHover: false,
            stageHover: -1
        };
    },

    count(alias) {
        return this.props.counter[alias] || '';
    },

    handleSwitchStage(stage, e) {
        e.preventDefault();
        Router.go('Job', {
            jobId: this.props.jobId,
            stage: stage.alias
        });
    },

    render() {
        return (
            <div className="row job-hiring-process">
                {this.state.stages.map(this.renderStage)}
            </div>
        );
    },

    renderStage(stage, key) {

        let cx = classNames(
            'col-md-2',
            'stage',
            {active: this.props.currentStage.id === stage.id}
        );

        return (
            <div key={key} className={cx}>
                <a className="link" onClick={ (e) => this.handleSwitchStage(stage, e) }>
                    <span className="count">{this.count(stage.alias)}</span>
                    <span className="title">{stage.label}</span>
                </a>
            </div>
        );
    }
});