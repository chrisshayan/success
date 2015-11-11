let cx = React.addons.classSet || Classnames || false;

function formatCoverletter(coverLetter) {
    if (typeof coverLetter !== 'string') return '';
    return coverLetter.split(/\s+/).splice(0, 14).join(" ") + "...";
}


JobCandidate = React.createClass({

    componentDidMount() {

    },

    render() {
        var app = this.props.application;
        var can = app.candidateInfo;
        var fullname = can.fullname;
        var appliedDate = moment(app.createdAt).fromNow();
        var coverLetter = formatCoverletter(app.coverLetter);
        var matchingScore = app.matchingScore;
        var disqualified = app.disqualified;
        var city = can.city;
        var link = app.link();

        var matchingScoreLabel = null;
        if (matchingScore > 0) {
            matchingScoreClass = "label pull-right " + app.matchingScoreLabel();
            matchingScoreLabel = (<span className={matchingScoreClass}>{ matchingScore }%</span>);
        }
        var containerClass = {};
        if (cx)
            containerClass = cx({
                "active": this.props.selected,
                "list-group-item": true,
                "clear": true
            });

        return (
            <li className={containerClass} style={ styles.jobCandidate.container }>
                <CandidateCheckbox id={app._id} checked={this.props.checked} onToggleSelectApp={this.props.onToggleSelectApp}/>

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
                            {disqualified ? <span className="label pull-right label-danger"
                                                  style={ {marginRight: "3px"} }>
                                <i className="fa fa-thumbs-down"></i></span> : null}
                            <i className="fa fa-map-marker"></i> { city }
                        </p>
                    </div>
                </a>
            </li>
        );
    }
});

CandidateCheckbox = React.createClass({
    contextTypes: {
        actions: React.PropTypes.object
    },

    componentDidMount() {
        var self = this;



//        var el = React.findDOMNode(this.refs.checkbox);

        let el = this.refs.checkbox.findDOMNode();

        $(el).iCheck({
            checkboxClass: 'icheckbox_square-green'
        });
        if (this.props.checked) {
            $(el).iCheck('check');
        }

        $(el).on('ifClicked', function() {
            console.log(112234)
        });
        //this.props.onToggleSelectApp(self.props.id);
    },

    componentWillUpdate(nextProps, nextState) {

/*
        if (this.props.checked != nextProps.checked) {
            var el = React.findDOMNode(this.refs.checkbox);
            if (nextProps.checked) {
*/

        if(this.props.checked != nextProps.checked) {
            let el = this.refs.checkbox.findDOMNode();
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
                <input type="checkbox" ref="checkbox" />
            </div>
        );
    }
});
