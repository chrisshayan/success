let { Input } = ReactBootstrap;
let cx = React.addons.classSet;
var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

JobCandidate = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin("JobDetailsStore")],
    getStateFromFlux() {
        return this.getFlux().store("JobDetailsStore").getCandidateState(this.props.candidate);
    },

    componentDidMount() {

    },

    render() {
        var can = this.props.candidate;
        var app = can.application;
        var fullname = can.fullname();
        var appliedDate = moment(app.createdAt).fromNow();
        var coverLetter = app.shortCoverLetter();
        var matchingScore = app.matchingScore;
        var disqualified = app.disqualified;
        var city = can.city();
        var link = app.link();

        var matchingScoreLabel = null;
        if(matchingScore > 0) {
            matchingScoreClass = "label pull-right " +app.matchingScoreLabel();
            matchingScoreLabel = (<span className={matchingScoreClass}>{ matchingScore }%</span>);
        }

        var containerClass = cx({
            active: this.props.selected,
            "list-group-item": true,
            "clear": true
        });

        return (
            <li className={containerClass} style={ styles.jobCandidate.container }>
                <CandidateCheckbox id={app._id} checked={this.state.selected}/>

                <a href={link} style={ styles.jobCandidate.candidateInfo }>
                    <small className="pull-right text-muted">{ appliedDate }</small>
                    <strong>{fullname}</strong>

                    <div className="small m-t-xs">
                        <p className="m-b-xs">
                            { coverLetter }
                            <br/>
                        </p>

                        <p className="m-b-none">
                            {matchingScoreLabel}
                            {disqualified ? <span className="label pull-right label-danger" style={ {marginRight: "3px"} }><i className="fa fa-thumbs-down"></i></span> : null}
                            <i className="fa fa-map-marker"></i> { city }
                        </p>
                    </div>
                </a>
            </li>
        );
    }
});

CandidateCheckbox = React.createClass({
    mixins: [FluxMixin],
    componentDidMount() {
        var self = this;
        var flux = this.getFlux();

        var el = React.findDOMNode(this.refs.checkbox);
        $(el).iCheck({
            checkboxClass: 'icheckbox_square-green'
        });
        if(this.props.checked) {
            $(el).iCheck('check');
        }

        $(el).on('ifClicked', function (event) {
            flux.actions.toggleSelectCandidate(self.props.id);
        });
    },

    componentWillUpdate(nextProps, nextState) {
        if(this.props.checked != nextProps.checked) {
            var el = React.findDOMNode(this.refs.checkbox);
            if(nextProps.checked) {
                $(el).iCheck('check');
            } else {
                $(el).iCheck('uncheck');
            }
        }
    },

    render() {
        return (
            <div style={styles.jobCandidate.selectBox}>
                <input type="checkbox" ref="checkbox" className="candidate-select" />
            </div>
        );
    }
});
