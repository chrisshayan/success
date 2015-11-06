let {
    Tabs,
    Tab
} = ReactBootstrap;

JobCandidateProfileContent = React.createClass({
    getInitialState() {
        return {
            key: 1
        };
    },

    handleSelect(key) {
        this.setState({key});
    },
    render() {
        return (
            <div>
                <JobCandidateShortInfo application={this.props.application} candidate={this.props.candidate}/>
                <Tabs id="job-candidate-content" activeKey={this.state.key} onSelect={this.handleSelect}>
                    <Tab eventKey={1} title="Timeline">
                        <JobCandidateTimeline />
                    </Tab>
                    <Tab eventKey={2} title="Profile">
                        <JobCandidateResume
                            job={this.props.job}
                            stage={this.props.stage}
                            application={this.props.application}
                            candidate={this.props.candidate}
                            resume={this.props.resume} />
                    </Tab>
                    <Tab eventKey={3} title="Scorecard summary">
                        <JobCandidateScorecardSummary />
                    </Tab>
                </Tabs>
            </div>
        );
    }
});