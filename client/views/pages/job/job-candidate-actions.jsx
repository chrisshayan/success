let {
    Affix
    } = ReactOverlays;

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

    nextStage() {
        return this.state.nextStage ? this.state.nextStage.label : '';
    },

    handleMoveNextState(e) {
        e.preventDefault();
        this.props.actions.moveStage(this.state.nextStage.id);
    },
    handleMoveToStage(stageId, e) {
        e.preventDefault();
        this.props.actions.moveStage(stageId);
    },

    isDisqualified() {
        const is = false
            , app = this.props.application
            , stage = this.props.stage;

        if (app) {
            return app['disqualified'] && app['disqualified'].indexOf(stage.alias) >= 0;
        }
        return is;
    },

    goActionLink(type) {
        const params = Router.current().params;
        let query = _.clone(params.query);
        if (!query) query = {};
        if(query['appAction'] === type) {
            this.props.actions.changeTab(2);
        } else {
            query['appAction'] = type;
            Router.go('Job', {
                jobId: this.props.job.jobId,
                stage: this.props.stage.alias
            }, {
                query: query
            });
        }
    },

    onSelectAction(type, e) {
        e.preventDefault();
        this.goActionLink(type);
    },

    renderButton(isDisqualified){
        let btnList = [];
        btnList.push(<a key={0} className="btn btn-default btn-outline btn-sm " href='#'
                        onClick={(e) => this.onSelectAction('comment', e)}>
            Add comment
        </a>);

        if (!isDisqualified) {
            btnList.push(<a key={1} className="btn btn-default btn-outline btn-sm " href='#'
                            onClick={(e) => this.onSelectAction('message', e)}>
                Send message
            </a>);

            btnList.push(<a key={2} className="btn btn-default btn-outline btn-sm " href='#'
                            onClick={(e) => this.onSelectAction('scheduleInterview', e)}>
                Schedule interview
            </a>);

            btnList.push(<a key={3} className="btn btn-default btn-outline btn-sm " href='#'
                            onClick={(e) => this.onSelectAction('scoreCandidate', e)}>
                Score candidate
            </a>);

            btnList.push(<button key={4} className="btn btn-default btn-outline btn-sm"
                                 onClick={ this.props.actions.disqualify }>
                Disqualify
            </button>);
            btnList.push(<button
                key={5}
                className="btn btn-primary btn-outline btn-sm"
                onClick={this.handleMoveNextState}>

                <i className="fa fa-arrow-right"/>&nbsp;
                {this.nextStage()}
            </button>);

            btnList.push(<button key={6} type="button" className="btn btn-primary btn-outline btn-sm dropdown-toggle"
                                 data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span className="caret"/>
                </button>
            );
            btnList.push(this.renderMoveAbilities());
        } else {
            btnList.push(
                <button
                    key={1}
                    className="btn btn-primary btn-outline btn-sm"
                    onClick={ this.props.actions.revertQualify }>
                    Revert qualify
                </button>
            )
        }

        return btnList;

    },


    render() {

        let styles = {
            actionsContainer: {
                backgroundColor: '#fff',
                padding: '5px 15px',
                borderBottom: '1px solid #E0E0E0',
            }
        };
        return (
            <Affix offsetTop={160} affixClassName="affix" className="job-candidate-actions"
                   affixStyle={{width: this.props.containerWidth + 'px'}}>
                <div className="profile-actions" style={styles.actionsContainer}>
                    <div className="row">
                        <div className="hidden-xs hidden-sm hidden-md col-lg-2">
                            <div style={{position: 'absolute'}}>
                                <h2 className="profile-action-title">{this.candidateName()}</h2>
                            </div>
                        </div>

                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 pull-right"
                             style={{paddingBottom: '3px'}}>
                            <div className="job-candidate-actions">
                                <div className="btn-group pull-right">
                                    {this.renderButton(this.isDisqualified())}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Affix>
        );
    },

    renderMoveAbilities() {
        let stages = _.sortByOrder(_.toArray(Success.APPLICATION_STAGES), 'id', 'asc');
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
            <ul className="dropdown-menu" key={7}>
                {menu}
            </ul>
        );
    }
});