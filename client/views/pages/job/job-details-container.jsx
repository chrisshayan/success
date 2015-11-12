JobDetailsContainer = React.createClass({
    mixins: [ReactMeteorData, React.addons.LinkedStateMixin],
    getInitialState() {
        return {
            currentTab: 1,
            currentAppId: ''
        }
    },

    getMeteorData() {
        let params = Router.current().params,
            jobId = params._id,
            stage = _.findWhere(Success.APPLICATION_STAGES, {alias: params.stage});

        let job = Meteor.jobs.findOne({_id: jobId});

        return {
            jobId: jobId,
            stage: stage,
            job: job
        }
    },

    componentDidMount() {
        Meteor.call('getCVToken', function (err, token) {
            if (!err && token) {
                Session.set('cvToken', token);
            }
        });
    },


    childContextTypes: {
        nextApplication: React.PropTypes.func,
        selectApplication: React.PropTypes.func
    },

    getChildContext: function () {
        return {
            nextApplication: this.nextApplication,
            selectApplication: this.selectApplication
        };
    },

    selectApplication(appId) {
        $('body').animate({
            scrollTop: 0
        }, 'slow');
        this.setState({
            currentAppId: appId
        });
    },

    nextApplication(app) {
        let job = this.data.job,
            stage = this.data.stage,
            currentApp = this.data.application;

        let routeParams = {
            _id: job._id,
            stage: stage.alias
        };
        let routeQuery = {};

        let filter = {
            jobId: job.jobId,
            stage: stage.id
        };

        let option = {
            sort: {createdAt: -1}
        };

        if (this.state.currentTab == 1) {
            filter['disqualified'] = false;

        } else if (this.state.currentTab == 2) {
            filter['disqualified'] = true;
        }
        if (currentApp) {
            filter['_id'] = {
                '$ne': currentApp._id
            };
        }
        let nextApp = Meteor.applications.findOne(filter, option);
        if (nextApp) {
            routeQuery['query'] = {application: nextApp._id};
        }
        if (app) {
            routeQuery['query'] = {application: app._id};
        }
        Router.go('Job', routeParams, routeQuery);
    },


    render(){
        console.log('this.state.currentAppId', this.state.currentAppId);
        return (
            <div className="row" style={{paddingBottom: '60px'}}>
                <div className="col-md-12">
                    <JobHeader job={this.data.job} stage={this.data.stage}/>
                    <JobHiringProcess job={this.data.job} currentStage={this.data.stage}/>
                </div>
                <div className="col-md-12">
                    <div id="job-content">
                        <JobCandidatesContainer
                            job={this.data.job}
                            stage={this.data.stage}
                            currentAppId={this.state.currentAppId}
                            onChangeTab={(key) => { this.setState({currentTab: key}) }}
                        />

                        <JobCandidateProfile
                            job={this.data.job}
                            stage={this.data.stage}
                            applicationId={this.state.currentAppId}
                        />

                    </div>
                </div>
            </div>
        );
    }
});










