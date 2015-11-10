let {
    Tabs,
    Tab
    } = ReactBootstrap;

let Sub1 = new SubsManager({
    cacheLimit: 100,
    expireIn: 10
});

let Sub2 = new SubsManager({
    cacheLimit: 100,
    expireIn: 10
});

JobCandidatesContainer = React.createClass({
    contextTypes: {
        nextApplication: React.PropTypes.func
    },
    getInitialState() {
        return {
            key: 1,
            counter: {
                qualify: 0,
                disqualified: 0
            }
        };
    },

    updateCounter() {
        Meteor.call('applicationStageCount', this.props.job._id, this.props.stage.id, (err, result) => {
            if (!err) {
                if (!_.isEqual(result, this.state.counter)) {
                    this.setState({counter: result});
                }
            }
        })
    },

    handleSelect(key) {
        this.setState({key});
        this.props.onChangeTab && this.props.onChangeTab(key);
    },

    render() {
        let content = null;
        let tab1Title = 'QUALIFIED';
        let tab2Title = 'DISQUALIFIED';
        if(this.state.counter.disqualified > 0) {
            tab2Title = `DISQUALIFIED (${this.state.counter.disqualified})`;
        }

        content = (
            <Tabs id="job-candidates-container" activeKey={this.state.key} onSelect={this.handleSelect}>
                <Tab eventKey={1} title={tab1Title} className="qualify">
                    <JobCandidates
                        subCache={Sub1}
                        job={this.props.job}
                        stage={this.props.stage}
                        disqualified={false}
                        currentAppId={this.props.currentAppId}
                        onUpdateCounter={this.updateCounter} />
                </Tab>

                <Tab eventKey={2} title={tab2Title}  className="disqualified">
                    <JobCandidates
                        subCache={Sub2}
                        job={this.props.job}
                        stage={this.props.stage}
                        disqualified={true}
                        currentAppId={this.props.currentAppId}
                        onUpdateCounter={this.updateCounter} />
                </Tab>
            </Tabs>
        );
        return content;
    }
});