ScoreCardForm = React.createClass({
    getInitialState() {
        return {
            overall: null,
            notes: {
                fitCompanyCulture: "",
                keyTakeAways: ""
            },
            criteria: {}
        };
    },

    componentWillMount() {
        this.props.actions.changeTab(2);
    },

    componentDidMount() {
        this.getScorecard();
        this.initCriteriaState();

        let container = $("#job-candidate-content");
        let actionContainer = $('.job-candidate-actions');
        var body = $("html, body");
        let scrollTo = 0;
        if (actionContainer && actionContainer.hasClass('affix')) {
            scrollTo = container.offset().top - 45;
        } else {
            scrollTo = container.offset().top - 50 - 45;
        }
        body.stop().animate({scrollTop: scrollTo}, '500', 'swing');
    },

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(prevState['scorecard'], this.state.scorecard)) {
            this.initCriteriaState();
        }
    },

    initCriteriaState() {
        if (this.props.extra && this.props.extra.hiringCriteria) {
            let criteria = {};
            _.each(this.props.extra.hiringCriteria, (cri) => {
                criteria[cri.alias] = {};
                _.each(cri.criteria, (n) => {
                    criteria[cri.alias][n] = {
                        name: n,
                        point: null,
                        note: '',
                        type: cri.alias
                    };
                });
            });
            if (this.state.scorecard) {
                _.each(this.state.scorecard.score_criteria, (cri) => {
                    if (criteria[cri.type] && criteria[cri.type][cri.name]) {
                        criteria[cri.type][cri.name] = cri;
                    }
                });
            }
            this.setState({criteria});
        }
    },

    getScorecard() {
        Meteor.call('getScoreCard', this.props.appId, (err, scorecard) => {
            if (!err && scorecard) {
                this.setState({
                    overall: scorecard.overall,
                    notes: scorecard.notes,
                    scorecard: scorecard
                })
            } else {
                if(Router.current().params.query['initDecision']) {
                    const overall = +Router.current().params.query['initDecision'];
                    this.setState({ overall });
                }
            }
        });
    },

    handleChangeOverall(overall) {
        this.setState({overall});
    },

    handleChangeNotes(notes) {
        this.setState({notes});
    },

    handleChangeCriteria(cri) {
        let criteria = this.state.criteria;
        if (criteria[cri.type] && criteria[cri.type][cri.name]) {
            criteria[cri.type][cri.name] = cri;
            this.setState({criteria});
        }
    },

    handleSave(e) {
        e.preventDefault();
        const data = {};
        data['overall'] = this.state.overall;
        data['notes'] = this.state.notes;
        const criteria = [];
        _.each(_.toArray(this.state.criteria), (items) => {
            _.each(_.toArray(items), (item) => {
                criteria.push(item);
            });
        });
        data['criteria'] = criteria;
        this.props.onSave && this.props.onSave(data);
    },

    candidateName() {
        if (this.props.application) {
            return this.props.application['fullname'] || '';
        }
        return '';
    },

    render() {
        return (
            <div className="scorecard-form">
                <div className="scorecard-header">
                    <h2>
                        <span style={{fontWeight: 400}}>{this.candidateName()}</span>&nbsp;
                        <span style={{fontSize: '20px'}}>Scorecard</span>
                    </h2>
                </div>

                <div className="scorecard-overall">
                    <div className="row">
                        <div className="col-md-12">
                            <h3>
                                Overall recommendation
                                <span>&nbsp;</span>
                                <small>Did the candidate pass the interview?</small>
                            </h3>
                        </div>
                    </div>

                    <ScoreCardOverall onChange={this.handleChangeOverall} overall={this.state.overall}/>
                </div>

                <div className="scorecard-notes">
                    <ScoreCardNotes onChange={this.handleChangeNotes} notes={ this.state.notes }/>
                </div>

                <div className="scorecard-criteria">
                    <div className="row">
                        <div className="col-md-12">
                            <h3>
                                Does the candidate show clear competence in the following areas?
                            </h3>
                        </div>
                    </div>

                    {this.props.extra.hiringCriteria && _.toArray(this.props.extra.hiringCriteria).map((criteria, key) =>
                        <ScoreCardCriteriaSet key={key} alias={criteria.alias} name={criteria.name}
                                              criteria={this.state.criteria[criteria.alias] || {}}
                                              onChangeCriteria={this.handleChangeCriteria}/>)}
                </div>

                <div className="scorecard-footer">
                    <button className="btn btn-primary btn-outline" onClick={this.handleSave}>Save</button>
                    <span>&nbsp;</span>
                    <button className="btn btn-default btn-outline" onClick={this.props.onDiscard}>
                        Discard
                    </button>
                </div>

            </div>
        );
    }
});

const ScoreCardOverall = React.createClass({
    getInitialState() {
        return {
            options: [
                {name: 'Definitely Not', value: 1},
                {name: 'No', value: 2},
                {name: 'Yes', value: 3},
                {name: 'Strong Yes', value: 4}
            ]
        };
    },

    handleChange(value, e) {
        e.preventDefault();
        this.props.onChange && this.props.onChange(value);
    },

    render() {
        return (
            <div className="btn-group" data-toggle="buttons">
                {this.state.options.map(this.renderOption)}
            </div>
        );
    },

    renderOption(opt, key) {
        const isChecked = this.props.overall && this.props.overall == opt.value;
        const labelClassname = classNames('btn btn-default btn-outline decision-option col-md-3', {
            active: isChecked
        });

        return (
            <label className={labelClassname} key={key}
                   onClick={(e) => this.handleChange(opt.value, e)}>
                <input
                    type="radio"
                    name="overall"
                    autoComplete="off" checked={isChecked}/>
                {opt.name}
            </label>
        );
    }
});


const ScoreCardNotes = React.createClass({
    getInitialState() {
        return {
            keyTakeAways: '',
            fitCompanyCulture: ''
        };
    },

    componentDidMount() {

        if (this.props.notes) {
            notes = _.pick(this.props.notes, 'keyTakeAways', 'fitCompanyCulture');
            this.setState(notes);
        }
    },

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(this.props.notes, prevState)) {
            notes = _.pick(this.props.notes, 'keyTakeAways', 'fitCompanyCulture');
            this.setState(notes);
            _.each(notes, (val, key) => {
                this.refs[key] && (this.refs[key].getDOMNode().value = val);
            });
        }
    },

    handleChange(type, e) {
        e.preventDefault();
        const notes = {
            keyTakeAways: this.state.keyTakeAways,
            fitCompanyCulture: this.state.fitCompanyCulture
        };
        notes[type] = e.target.value;
        this.props.onChange && this.props.onChange(notes);
        this.setState(notes);
    },

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-12">
                        <h3>
                            KEY TAKE-AWAYS
                            <span>&nbsp;</span>
                            <small>(conclusions, props, cons and things to follow up on)</small>
                        </h3>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <MentionInput
                            ref="keyTakeAways"
                            value={ this.state.keyTakeAways }
                            onBlur={(e) => this.handleChange('keyTakeAways', e)}
                            onChange={(e) => this.handleChange('keyTakeAways', e)} />
                    </div>
                </div>
                <br/>

                <div className="row">
                    <div className="col-md-12">
                        <h3>
                            How well would this candidate fit into the company culture?
                        </h3>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <MentionInput
                            ref="fitCompanyCulture"
                            value={ this.state.fitCompanyCulture }
                            onBlur={(e) => this.handleChange('fitCompanyCulture', e)}
                            onChange={(e) => this.handleChange('fitCompanyCulture', e)} />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <p className="text-muted">Tip: mention someone using '@'</p>
                    </div>
                </div>
            </div>
        );
    }
});

const ScoreCardCriteriaSet = React.createClass({
    render() {
        const items = _.toArray(this.props.criteria);
        return (
            <div className="criteria-set">
                <div className="row">
                    <div className="col-md-12">
                        <h4>{ this.props.name }</h4>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        {_.isEmpty(items) ? (
                            <p className="text-muted" style={{border: '1px dashed #ddd', padding: '10px'}}>There is no
                                criteria</p>
                        ) : (
                            <table className="table table-bordered">
                                <tbody>
                                {items.map((cri, key) => {
                                    return <ScoreCardCriteria
                                        key={key}
                                        criteria={cri}
                                        onChange={(cri) => this.props.onChangeCriteria(cri)}/>
                                })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        );
    }
});


ScoreCardCriteria = React.createClass({
    getInitialState() {
        return {
            points: [
                {name: 'Definitely Not', value: 1, icon: 'fa fa-times-circle-o', class: 'score score-definitely-not'},
                {name: 'No', value: 2, icon: 'fa fa-thumbs-down', class: 'score score-no'},
                {name: 'Neutral', value: 3, icon: 'fa fa-minus-circle', class: 'score score-neutral'},
                {name: 'Yes', value: 4, icon: 'fa fa-thumbs-up', class: 'score score-yes'},
                {name: 'Strong Yes', value: 5, icon: 'fa fa-star', class: 'score score-strong-yes'}
            ],
            point: null,
            note: '',
            isEditingNode: false
        };
    },

    componentDidMount() {
        $('[data-toggle="tooltip"]').tooltip();
        if (!_.isEmpty(this.props.criteria['note'])) {
            this.setState({
                note: this.props.criteria['note'],
                isEditingNode: true
            });
        }
    },

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(this.props.criteria, prevProps.criteria)) {
            this.setState(this.props.criteria);
            if (this.props.criteria['note']) {
                this.setState({
                    isEditingNode: true,
                    note: this.props.criteria['note']
                });
            }
        }
    },

    handleClickAddNote(e) {
        e.preventDefault();
        this.setState({
            isEditingNode: true
        })
    },
    handleCloseAddNote(e) {
        e.preventDefault();
        this.setState({
            isEditingNode: false
        })
    },

    data() {
        return {
            name: this.props.criteria.name,
            point: this.state.point,
            note: this.state.note,
            type: this.props.criteria.type
        }
    },

    handleChangePoint(point) {
        const data = this.data();
        data['point'] = point;
        this.setState(data)
        this.props.onChange && this.props.onChange(data);
    },

    handleChangeNote(note) {
        const data = this.data();
        data['note'] = note;
        this.setState(data)
        this.props.onChange && this.props.onChange(data);
    },

    render() {

        let button = null;
        if (!_.isEmpty(this.props.note)) {
            if (this.state.isEditingNode) {
                button = (
                    <button className="btn-link" onClick={this.handleCloseAddNote}>
                        <i className="fa fa-times"/>&nbsp;close
                    </button>
                );
            } else {
                button = (
                    <button className="btn-link" onClick={this.handleClickAddNote}>
                        <i className="fa fa-pencil"/>&nbsp;note
                    </button>
                );
            }
        } else {
            if (this.state.isEditingNode) {
                button = (
                    <button className="btn-link" onClick={this.handleCloseAddNote}>
                        <i className="fa fa-times"/>&nbsp;hide
                    </button>
                );
            } else {
                button = (
                    <button className="btn-link" onClick={this.handleClickAddNote}>
                        <i className="fa fa-plus"/>&nbsp;note
                    </button>
                );
            }
        }

        return (
            <tr>
                <td width="50%">
                    <span className="criteria-name">
                        { this.props.criteria.name }
                    </span>
                </td>
                <td>
                    <div className="clearfix">
                        <div className="pull-left" style={{width: '80%'}}>
                            <div className="btn-group criteria" data-toggle="buttons">
                                {this.state.points.map(this.renderPoint)}
                            </div>

                            {this.state.isEditingNode && (
                                <ScoreCardCriteriaNote note={this.state.note}
                                                       onChange={(val) => this.handleChangeNote(val)}/>
                            )}
                        </div>

                        <div className="pull-right text-right">
                            { button }
                        </div>
                    </div>
                </td>
            </tr>
        );
    },

    renderPoint(point, key) {
        const isChecked = this.props.criteria && this.props.criteria.point == point.value;
        const cx = classNames('btn', 'btn-link', {
            active: isChecked
        });

        return (
            <label className={cx} key={key} data-toggle="tooltip" data-placement="bottom" title={point.name}
                   onClick={() => this.handleChangePoint(point.value)}>
                <input type="radio" name={this.props.name} autoComplete="off" checked={isChecked}/>
                <span className={point.class}>
                    <i className={point.icon}/>
                </span>
            </label>
        );
    }
});

ScoreCardCriteriaNote = React.createClass({
    componentDidMount() {
        const el = this.refs.note.getDOMNode();
        el.value = this.props.note;
    },

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.note, this.props.note)) {
            const el = this.refs.note.getDOMNode();
            el.value = this.props.note;
        }
    },

    handleChange(e) {
        e.preventDefault();
        this.props.onChange && this.props.onChange(e.target.value);
    },

    render() {
        const style = {
            margin: '3px'
        };
        return (
            <textarea
                ref="note"
                rows="2"
                className="form-control"
                style={ style }
                defaultValue={this.props.note || ''}
                onBlur={this.handleChange}/>
        );
    }
})
