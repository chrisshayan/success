JobCandidateProfile = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        job: React.PropTypes.object.isRequired,
        stage: React.PropTypes.object.isRequired,
        applicationId: React.PropTypes.string
    },

    getInitialState() {
        return {
            width: 600
        };
    },

    getMeteorData() {
        console.log(this.props.applicationId)
        let sub = Meteor.subscribe('application', this.props.applicationId);
        let app = Collections.Applications.findOne({_id: this.props.applicationId});
        let can = app ? Collections.Candidates.findOne({candidateId: app.candidateId}) : null;
        return {
            isReady: sub.ready(),
            application: app,
            candidate: can
        };
    },

    componentDidMount() {
        let el = this.refs.container.getDOMNode();
        let updateWidth = () => {
            if($(el).width() != this.state.width) {
                this.setState({
                    width: $(el).width()
                });
            }
        };

        $(el).on('resize', () => { updateWidth() });
        $(window).on('resize', () => { updateWidth() });
        updateWidth();
    },

    render() {
        let content = null;
        if (this.data.isReady) {
            if (this.data.application) {
                content = (
                    <div className="content">
                        <JobCandidateProfileActions
                            job={this.props.job}
                            stage={this.props.stage}
                            application={this.data.application}
                            candidate={this.data.candidate}
                            containerWidth={this.state.width} />

                        <JobCandidateProfileContent
                            job={this.props.job}
                            stage={this.props.stage}
                            application={this.data.application}
                            candidate={this.data.candidate}/>
                    </div>
                );
            } else {
                content = (
                    <div className="no-application">
                        <i className="fa fa-sticky-note-o"/>
                        <h1>No application</h1>
                    </div>
                );
            }
        } else {
            content = <WaveLoading />
        }

        return (
            <div className="job-candidate-profile" ref={'container'}>
                {content}
            </div>
        );
    }
});