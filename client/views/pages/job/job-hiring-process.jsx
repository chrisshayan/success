JobHiringProcess = React.createClass({
    contextTypes: {
        selectApplication: React.PropTypes.func
    },

    getInitialState() {
        return {
            stages: _.toArray(Success.APPLICATION_STAGES),
            isHover: false,
            stageHover: -1
        };
    },

    count(id) {
        let stages = this.props.job && this.props.job.stages
            ? this.props.job.stages
            : {};
        return stages[id] || '';
    },

    handleSwitchStage(stage, e) {
        e.preventDefault();
        this.context.selectApplication(null);
        Router.go('Job', {
            _id: this.props.job ? this.props.job._id : '',
            stage: stage.alias
        });
    },

    render() {
        let styles = {};
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
                    <span className="count">{this.count(stage.id)}</span>
                    <span className="title">{stage.label}</span>
                </a>
            </div>
        );
    }
});