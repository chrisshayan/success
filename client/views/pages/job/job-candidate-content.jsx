let {
    Tabs,
    Tab
    } = ReactBootstrap;

JobCandidateProfileContent = React.createClass({
    getInitialState() {
        return {};
    },
    handleSelect(key) {
        this.props.onChangeTab && this.props.onChangeTab(key);
    },
    render() {

        return (
            <div>
                <JobCandidateShortInfo application={this.props.application} {...this.props} />
                <Tabs id="job-candidate-content" activeKey={this.props.tabState} onSelect={this.handleSelect}>
                    <Tab eventKey={1} title="Profile">
                        <JobCandidateResume
                            job={this.props.job}
                            stage={this.props.stage}
                            resume={this.props.resume}
                            application={this.props.application}
                        />
                    </Tab>
                    <Tab eventKey={2} title="Timeline">

                        <JobCandidateTimeline {...this.props} />

                    </Tab>
                    <Tab eventKey={3} title="Scorecard summary">
                        <JobCandidateScorecardSummary />

                    </Tab>
                </Tabs>
            </div>
        );
    }
});