let {
    Affix
    } = ReactBootstrap;

JobCandidateProfileActions = React.createClass({
    contextTypes: {
        selectApplication: React.PropTypes.func
    },

    getInitialState() {
        let current = this.props.stage;
        let nextStage = current;
        if (current.id < 5) {
            nextStage = Success.APPLICATION_STAGES[current.id + 1];
        }
        return {
            disableNextStage: current.id >= 5,
            nextStage: nextStage
        };
    },

    candidateName() {
        let app = this.props.application;
        if (!app || !app.candidateInfo) return '';
        return app.candidateInfo.firstName;
    },

    handleDisqualify() {
        var self = this;
        Meteor.call('disqualifyApplications', [this.props.application._id], function (err, result) {
            if (!err) {
                self.context.selectApplication(null);
            }
        });
    },

    handleRevertQualify() {
        var self = this;
        Meteor.call('revertApplication', this.props.application._id, function (err, result) {
            if (!err) {
                self.context.selectApplication(null);
            }
        });
    },

    nextStage() {
        return this.state.nextStage ? this.state.nextStage.label : '';
    },

    handleMoveNextState(e) {
        e.preventDefault();

        let data = {
            application: this.props.application._id,
            stage: this.state.nextStage.id
        };
        Meteor.call('updateApplicationStage', data, (err, result) => {
            if (!err) {
                this.context.selectApplication(null);
            }
        });
    },
    handleMoveToStage(stageId, e) {
        e.preventDefault();

        let data = {
            application: this.props.application._id,
            stage: stageId
        };
        Meteor.call('updateApplicationStage', data, (err, result) => {
            if (!err) {
                this.context.selectApplication(null);
            }
        });
    },

    handleAddComment(e) {
        e.preventDefault();

    },

    render() {
        let styles = {
            actionsContainer: {
                backgroundColor: '#fff',
                padding: '5px 15px',
                borderBottom: '1px solid #E0E0E0',
                position: 'relative'
            }
        };
        return (
            <Affix offsetTop={200} className="job-candidate-actions" style={{width: this.props.containerWidth + 'px'}}>
                <div className="profile-actions" style={styles.actionsContainer}>
                    <div className="row">
                        <div className="hidden-xs hidden-sm hidden-md col-lg-2">
                            <div style={{position: 'absolute'}}>
                                <h2 className="profile-action-title">{this.candidateName()}</h2>
                            </div>
                        </div>

                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-10 pull-right" style={{paddingBottom: '5px'}}>
                            <div className="job-candidate-actions">
                                <div className="btn-group pull-right">
                                    <button className="btn btn-default btn-outline btn-sm"
                                        onClick={() => this.props.onToggleAddComment()}
                                        disabled={this.props.isAddingComment}>
                                        Add comment
                                    </button>

                                    <button
                                        className="btn btn-default btn-outline btn-sm"
                                        onClick={() => this.props.onToggleSendMessage()}
                                        disabled={this.props.isSendingMessage} >
                                        Send message
                                    </button>

                                    <button className="btn btn-default btn-outline btn-sm">
                                        Schedule interview
                                    </button>

                                    <button className="btn btn-default btn-outline btn-sm">
                                        Score candidate
                                    </button>
                                    {!this.props.application.disqualified ? (
                                    <button className="btn btn-default btn-outline btn-sm"
                                            onClick={this.handleDisqualify}>
                                        Disqualify
                                    </button>
                                        ) : (
                                    <button
                                        className="btn btn-primary btn-outline btn-sm"
                                        onClick={this.handleRevertQualify}>
                                        Revert qualify
                                    </button>
                                        )}

                                    <button
                                        className="btn btn-primary btn-outline btn-sm"
                                        disabled={this.state.disableNextStage}
                                        onClick={this.handleMoveNextState}>

                                        <i className="fa fa-arrow-right"/>&nbsp;
                                        {this.nextStage()}
                                    </button>

                                    <button type="button" className="btn btn-primary btn-outline btn-sm dropdown-toggle"
                                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <span className="caret" />
                                    </button>
                                    {this.renderMoveAbilities()}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Affix>
        );
    },

    renderMoveAbilities() {
        let stages = _.sortByOrder(_.toArray(Success.APPLICATION_STAGES), 'id', 'desc');
        let current = this.props.stage;
        let menu = [];
        let key = 0;
        stages.map((stage) => {
            if ([0, 1].indexOf(current.id) >= 0 && [0, 1].indexOf(stage.id) >= 0) return;

            if (stage.id > current.id) {
                menu.push(
                    <li key={key}>
                        <a onClick={(e) => this.handleMoveToStage(stage.id, e)}>
                            <i className="fa fa-long-arrow-right"/>&nbsp;
                            {stage.label}
                        </a>
                    </li>
                );
            } else if (stage.id < current.id) {
                menu.push(
                    <li key={key}>
                        <a onClick={(e) => this.handleMoveToStage(stage.id, e)}>
                            <i className="fa fa-long-arrow-left"/>&nbsp;
                            {stage.label}
                        </a>
                    </li>
                )
            } else if (stage.id == current.id) {
                menu.push(<li key={key} role="separator" className="divider"/>);
            }
            key++;
        });

        return (
            <ul className="dropdown-menu">
                {menu}
            </ul>
        );
    }
});