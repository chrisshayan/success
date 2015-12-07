const { Modal, Button } = ReactBootstrap;
const SubCache = new SubsManager({
    cacheLimit: 1000,
    expireIn: 5
});

const HookMixin = {
    getInitialState() {
        let state = {
            jobId: 0,
            job: new ESJob(),
            stage: Success.APPLICATION_STAGES[1],
            candidateType: 1,
            currentAppId: null,
            currentAppAction: null,
            relatedJobs: [],
            resume: null,
            isLoading: true,
        };

        state = _.extend(state, JobApplications.getState());
        state = _.extend(state, JobCurrentApplication.getState());
        return state;
    },

    componentWillMount() {
        this.trackers = [];
        this.trackers.push(Tracker.autorun(() => {
            const nextState = {};
            let {query, jobId, stage} = Router.current().params;
            let { candidateType, appId, appAction } = query;

            const stageObj = _.findWhere(Success.APPLICATION_STAGES, {alias: stage});
            if(jobId) jobId = parseInt(jobId);
            if(appId) appId = parseInt(appId);
            if(candidateType) candidateType = parseInt(candidateType);
            if ([1, 2].indexOf(candidateType) < 0) candidateType = 1;

            if (!_.isEqual(stageObj, this.state.stage)) nextState['stage'] = stageObj;
            if (jobId != this.state.jobId) nextState['jobId'] = jobId;
            if (candidateType != this.state.candidateType) nextState['candidateType'] = candidateType;
            if (appId != this.state.currentAppId) nextState['currentAppId'] = appId;
            if (appAction != this.state.currentAppAction) nextState['currentAppAction'] = appAction;

            if (!_.isEmpty(nextState)) {
                this.setState(nextState);
            }
        }))
    },
    componentWillUnmount() {
        this.trackers && _.each(this.trackers, (tracker) => tracker.stop());
    },

    componentDidMount() {
        $('body').animate({
            scrollTop: 0
        }, 300);

        this.handle___GetJobInfo();
        this.handle___GetCVToken();
        this.handle___UpdateAppCounter(this.state.candidateType, null);
        if (this.state.currentAppId) {
            this.handle___GetResumeDetails();
        }

    },

    componentWillUpdate(nextProps, nextState) {
        try {
            this.handle___UpdateAppCounter(nextState.candidateType, this.state.candidateType);
        } catch (e) {

        }
    },

    componentDidUpdate(prevProps, prevState) {
        if (this.state.currentAppId != prevState.currentAppId) {
            this.handle___GetResumeDetails();
        }
    }

};

const DataMixin = {
    getMeteorData() {
        const JobExtraColl = JobExtra.getCollection(),
            AppColl = Application.getCollection(),
            extraCond = {jobId: this.state.jobId};
        let extra = new JobExtra();
        if (JobExtraColl.find(extraCond).count()) {
            extra = JobExtraColl.findOne(extraCond);
        }

        /**
         * Get applications
         */
        const appsFilter = this.filter__apps(),
            appsOptions = this.option__apps(),
            isReady = SubCache.subscribe('getApplications', appsFilter, appsOptions).ready();

        return {
            extra: extra,
            stageCounter: extra.stage,
            isReady: isReady,
            applications: AppColl.find(appsFilter, appsOptions).fetch(),
            hasMore: Application.find(appsFilter).count() > this.state.apps__limit
        };
    },


    filter__apps() {
        const jobId = this.state.jobId,
            q = this.state.apps__search,
            stage = this.state.stage,
            disqualified = this.state.candidateType == 2,
            f = {};

        f['jobId'] = jobId;
        f['stage'] = stage.id;

        // search criteria
        if (q.length > 0) {
            let searchCriteria = [];
            searchCriteria.push({
                'fullname': {
                    '$regex': q,
                    '$options': 'i'
                }
            });

            searchCriteria.push({
                'emails': {
                    '$regex': q,
                    '$options': 'i'
                }
            });
            f['$or'] = searchCriteria;
        }

        // filter applications by qualify
        if (disqualified) {
            f['disqualified'] = stage.alias;
        } else {
            f['disqualified'] = {
                '$nin': [stage.alias]
            }
        }

        return f;
    },

    option__apps() {
        const limit = this.state.apps__limit,
            sortField = this.state.apps__sortField,
            sortType = this.state.apps__sortType;

        return {
            limit: limit,
            sort: {
                [sortField]: sortType
            }
        };
    }
};

const currentAppActions = function () {
    const actions = {};


    return actions;
}

const ActionMixin = {
    handle___GetJobInfo() {
        Meteor.call('getJobInfo', this.state.jobId, (err, job) => {
            const state = {
                isLoading: false
            };
            if (!err) {
                state['job'] = job;
            }
            this.setState(state);
        });
    },

    handle___GetCVToken() {
        Meteor.call('getCVToken', function (err, token) {
            if (!err && token) {
                Session.set('cvToken', token);
            }
        });
    },

    handle___UpdateAppCounter(type = 1, prevType = null) {
        Meteor.call('applicationStageCount', this.state.jobId, this.state.stage.id, (err, result) => {
            if (!err) {
                if (!_.isEqual(result, this.state.apps__counter) || type != prevType) {
                    if (!result)
                        result = {
                            qualify: 0,
                            disqualified: 0
                        };

                    const state = {
                        apps__counter: result
                    };
                    this.setState(state);
                }
            }
        });
    },

    handle___GetResumeDetails() {
        Meteor.call('getResumeDetails', this.state.currentAppId, (err, result) => {
            if (!err) {
                this.setState({
                    resume: result
                });
            }
        });
    },

    apps__Actions: JobApplications.getActions,
    current__Actions: JobCurrentApplication.getActions
};

const RendererMixin = {
    render__Content() {
        return (
            <div className="row" style={{paddingBottom: '60px'}}>
                <div className="col-md-12">
                    <JobHeader job={this.state.job} stage={this.state.stage}/>

                    <JobHiringProcess
                        jobId={this.state.jobId}
                        currentStage={this.state.stage}
                        counter={this.data.stageCounter}/>
                </div>
                <div className="col-md-12">
                    <div id="job-content">

                        <JobCandidatesContainer
                            jobId={ this.state.jobId }
                            job={ this.state.job }
                            stage={ this.state.stage }
                            counter={ this.state.apps__counter }
                            hasMore={ this.data.hasMore }
                            hasChecked={ this.state.apps__selectedItems.length > 0 }
                            currentAppId={ this.state.currentAppId }
                            candidateType={ this.state.candidateType }
                            applications={ this.data.applications }
                            isEmpty={ !this.state.isLoading && _.isEmpty(this.data.applications) }
                            actions={ this.apps__Actions() }
                            isSelectedAll={ this.state.apps__isSelectedAll }
                        />

                        <JobCandidateProfile
                            job={ this.state.job }
                            stage={ this.state.stage }
                            applicationId={ this.state.currentAppId }
                            resume={ this.state.resume }
                            appAction={ this.state.currentAppAction }
                            actions={ this.current__Actions() }
                        />

                        <Modal show={this.state.apps__showSendBulkMessage} bsSize={'large'} onHide={() =>{}}>
                            <Modal.Header>
                                <Modal.Title>Send bulk message</Modal.Title>
                            </Modal.Header>
                            {this.state.apps__showSendBulkMessage ? (
                                <MessageBox
                                    appIds={this.state.apps__selectedItems}
                                    onSave={this.apps__Actions().sendMessage}
                                    onDiscard={() => this.apps__Actions().toggleSendMessage(false) } />
                            ): null}
                        </Modal>
                    </div>
                </div>
            </div>
        );
    },

    render__Syncing() {
        return (
            <div className="row" style={{paddingBottom: '60px'}}>
                <div className="col-md-12">
                    <JobHeader job={this.state.job} stage={this.state.stage}/>

                    <JobHiringProcess
                        jobId={this.state.jobId}
                        currentStage={this.state.stage}
                        counter={this.data.stageCounter}/>
                </div>
                <div className="col-md-12">
                    <div id="job-content">
                        <div className="syncing">
                            <i className="fa fa-refresh fa-spin"></i>
                            <h2>Syncing your applications</h2>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

JobDetailsContainer = React.createClass({
    mixins: [ReactMeteorData, HookMixin, DataMixin, ActionMixin, RendererMixin],

    render(){
        console.log(this.data.extra.syncState)
        if (this.state.isLoading) {
            return <WaveLoading />;
        } else {
            if(this.data.extra && this.data.extra.syncState == 'ready') {
                return this.render__Syncing();
            } else {
                return this.render__Content();
            }
        }

    }
});