JobCandidateShortInfo = React.createClass({
    matchingScore() {
        if (this.props.application.matchingScore > 0) {
            return this.props.application.matchingScore + '%';
        }
        return null;
    },
    fullname() {
        let can = this.props.application.candidateInfo;
        return can.fullname;
    },
    headline() {
        let candidate = this.props.candidate.data;
        return candidate && candidate.jobtitle ? candidate.jobtitle : '';
    },
    birthday() {
        let candidate = this.props.candidate.data;
        return candidate && candidate.birthday ? moment(candidate.birthday).calendar() : '';
    },
    email() {
        let candidate = this.props.application.candidateInfo;
        return candidate.emails && candidate.emails.length ? candidate.emails[0] : '';
    },
    city() {
        let candidate = this.props.candidate.data;
        return candidate && candidate.city ? candidate.city : '';
    },
    phone() {
        let candidate = this.props.candidate.data;
        return candidate && candidate.cellphone ? candidate.cellphone : '';
    },

    picture() {
        let letter = '';
        let app = this.props.application;
        if(app && app['candidateInfo'] && app['candidateInfo']['firstName']) {
            letter = app['candidateInfo']['firstName'][0];
        }
        return `https://placeholdit.imgix.net/~text?txtsize=40&txt=${letter}&w=80&h=80`;
    },

    render() {
        let styles = {
            clearMP: {
                margin: 0,
                padding: 0
            }
        };
        return (
            <div id="job-candidate-short-info">
                <div className="row">
                    <div className="col-md-2 text-right">
                        <div style={{marginBottom: "5px"}}>
                            <img src={this.picture()} alt="" className="img-thumbnail"/>
                        </div>
                        {this.matchingScore()
                            ?(  <div>
                                    <span className="mc-score block text-right small">
                                        <div>{this.matchingScore()}</div>
                                        <span className="mc-logo"/>
                                    </span>
                        </div> )
                            : null }
                        {this.props.application.disqualified
                            ? (
                        <div>
                            <span className="text-danger">Disqualified</span>
                        </div>
                            ) : null}
                    </div>
                    <div className="col-md-10">
                        <div className="ibox">
                            <div style={{padding: '15px 0'}}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <h2 style={styles.clearMP}>
                                            {this.fullname()}
                                        </h2>
                                        <h3>{this.headline()}</h3>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-7">
                                        <div className="row mgbt-xs-0">
                                            <label className="col-xs-4 control-label">Birthday:</label>
                                            <div className="col-xs-8 controls">{this.birthday()}</div>
                                        </div>
                                    </div>

                                    <div className="col-md-5">
                                        <div className="row mgbt-xs-0">
                                            <label className="col-xs-5 control-label">City:</label>
                                            <div className="col-xs-7 controls">{this.city()}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-7">
                                        <div className="row mgbt-xs-0">
                                            <label className="col-xs-4 control-label">Email:</label>
                                            <div className="col-xs-8 controls">{this.email()}</div>
                                        </div>
                                    </div>

                                    <div className="col-md-5">
                                        <div className="row mgbt-xs-0">
                                            <label className="col-xs-5 control-label">Phone:</label>
                                            <div className="col-xs-7 controls">{this.phone()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});