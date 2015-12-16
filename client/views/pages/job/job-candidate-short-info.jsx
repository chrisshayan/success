const Model = Astro.Class({
    name: 'Model',
    fields: {
        firstname: {
            type: 'string',
            default: ''
        },

        lastname: {
            type: 'string',
            default: ''
        },

        fullname: {
            type: 'string',
            default() {
                return '';
            }
        },

        jobTitle: {
            type: 'string',
            default() {
                return '';
            }
        },

        cityName: {
            type: 'string',
            default() {
                return '';
            }
        },

        matchingScore: {
            type: 'number',
            default() {
                return 0;
            }
        },

        phone: {
            type: 'string',
            default() {
                return '';
            }
        },
        mobile: {
            type: 'string',
            default() {
                return '';
            }
        },
        emails: {
            type: 'array',
            default() {
                return [];
            }
        },

        dob: {
            type: 'date'
        },
        avatar: {
            type: 'string'
        },

        disqualified: {
            type: 'array',
            default() {
                return [];
            }
        }
    },

    methods: {
        score() {
            return this.matchingScore + '%';
        },

        picture() {
            if(this.avatar) return this.avatar;
            const letter = this.firstname.length > 0 ? this.firstname[0] : '';
            return `https://placeholdit.imgix.net/~text?txtsize=40&txt=${letter}&w=80&h=80`;
        },

        birthday() {
            const dob = moment(this.dob);
            return dob.isValid() ? dob.calendar() : '';
        },

        city() {
            return this.cityName;
        },

        defaultEmail() {
            return this.emails.length > 0 ? this.emails[0] : '';
        },

        isDisqualified(stage = '') {
            return this.disqualified.indexOf(stage) >= 0;
        }
    }
});

JobCandidateShortInfo = React.createClass({
    render() {
        const app = new Model(this.props.application);
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
                            <img src={ app.picture() } alt="" className="img-thumbnail"/>
                        </div>

                        { app.isDisqualified(this.props.stage.alias) ? (
                            <div>
                                <span className="text-danger">Disqualified</span>
                            </div>
                        ) : null}

                    </div>
                    <div className="col-md-10">
                        <div className="ibox">
                            <div>
                                <div className="row">
                                    <div className="col-md-7">
                                        <h2 style={styles.clearMP}>
                                            { app.fullname }
                                        </h2>

                                        <h3>{ app.jobTitle }</h3>
                                    </div>

                                    <div className="col-md-5">
                                        {app.matchingScore ? (
                                            <div>
                                                    <span className="mc-score block text-right small">
                                                        <div>{ app.score() }</div>
                                                        <span className="mc-logo"/>
                                                    </span>
                                            </div>
                                        ) : null }
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-7">
                                        <div className="row mgbt-xs-0">
                                            <label className="col-xs-4 control-label">Birthday:</label>

                                            <div className="col-xs-8 controls">{ app.birthday() }</div>
                                        </div>
                                    </div>

                                    <div className="col-md-5">
                                        <div className="row mgbt-xs-0">
                                            <label className="col-xs-5 control-label">City:</label>

                                            <div className="col-xs-7 controls">{ app.city() }</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-7">
                                        <div className="row mgbt-xs-0">
                                            <label className="col-xs-4 control-label">Email:</label>

                                            <div className="col-xs-8 controls">{ app.defaultEmail() }</div>
                                        </div>
                                    </div>

                                    <div className="col-md-5">
                                        <div className="row mgbt-xs-0">
                                            <label className="col-xs-5 control-label">Mobile:</label>

                                            <div className="col-xs-7 controls">{ app.mobile }</div>
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