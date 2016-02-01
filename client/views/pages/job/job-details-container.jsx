ResumeAdapter = Astro.createType({
    name: "ResumeAdapter",
    fields: {
        "resumeId": {
            type: 'number'
        },
        "jobSeekerId": {
            type: 'number'
        },
        "isCompleted": {
            type: 'number'
        },
        "isApproved": {
            type: 'number'
        },
        "isAttached": {
            type: 'number'
        },
        "avatar": {
            type: 'string'
        },
        "fullName": {
            type: 'string'
        },
        "nationality": {
            type: 'string'
        },
        "gender": {
            type: 'number'
        },
        "marital": {
            type: 'number'
        },
        "birthday": {
            type: 'string'
        },
        "address": {
            type: 'string'
        },
        "contactCity": {
            type: 'string'
        },
        "contactDistrict": {
            type: 'string'
        },
        "phoneNumber": {
            type: 'string'
        },
        "emailAddress": {
            type: 'string'
        },
        "lastUpdated": {
            type: 'string'
        },
        "highestDegree": {
            type: 'object'
        },
        "yearsExperience": {
            type: 'number'
        },
        "languageProficiency": {
            type: 'array'
        },
        "mostRecentJobTitle": {
            type: 'string'
        },
        "mostRecentCompany": {
            type: 'string'
        },
        "currentJobLevel": {
            type: 'object'
        },
        "expectedJobTitle": {
            type: 'string'
        },
        "expectedJobLevel": {
            type: 'object'
        },
        "expectedLocation": {
            type: 'array'
        },
        "expectedIndustry": {
            type: 'array'
        },
        "expectedSalary": {
            type: 'number'
        },
        "profileObjective": {
            type: 'string'
        },
        "careerHighlights": {
            type: 'string'
        },
        "educations": {
            type: 'object'
        },
        "experiences": {
            type: 'object'
        },
        "references": {
            type: 'object'
        },
        "methodPosted": {
            type: 'number'
        },
        "isDeleted": {
            type: 'number'
        }
    }
});

ApplicationAdapter = Astro.createType({
    name: 'ApplicationAdapter',
    fields: {
        "entryId": {
            type: 'number'
        },
        "isAttached": {
            type: 'number'
        },
        "folderId": {
            type: 'number'
        },
        "coverLetter": {
            type: 'string'
        },
        "jobTitle": {
            type: 'string'
        },
        "jobId": {
            type: 'number'
        },
        "jobAlias": {
            type: 'string'
        },
        "jobOnlineDate": {
            type: 'string'
        },
        "fileName": {
            type: 'string'
        },
        "fileMine": {
            type: 'string'
        },
        "attachmentPath": {
            type: 'string'
        },
        "attachmentFileMime": {
            type: 'string'
        },
        "attachmentFileAlias": {
            type: 'string'
        },
        "appliedDate": {
            type: 'string'
        },
        "isDeleted": {
            type: 'number'
        }
    }
});


ResumeDetails = Astro.Class({
    name: 'ResumeDetails',
    fields: {
        resume: {
            type: 'ResumeAdapter'
        },

        application: {
            type: 'ApplicationAdapter'
        }
    },
    methods: {
        highestDegree() {
            if(this.resume && this.resume['highestDegree'] && this.resume['highestDegree']['id'] != 0) {
                return this.resume['highestDegree']['name']
            }
            return null;
        },

        yearsExperience() {
            if(this.resume && this.resume['yearsExperience'] && this.resume['yearsExperience']> 0) {
                return this.resume['yearsExperience'];
            }
            return null;
        },

        languageProficiency() {
            if(this.resume && this.resume['languageProficiency'] && this.resume['languageProficiency'].length > 0) {
                return this.resume['languageProficiency'].map((lang) => {
                    return `${lang.languageName} (${lang.languageLevelName})`;
                });
            }
            return null;
        },

        mostRecentJobTitle() {
            if(this.resume && this.resume['mostRecentJobTitle']) {
                return this.resume['mostRecentJobTitle'];
            }
            return null;
        },

        mostRecentCompany() {
            if(this.resume && this.resume['mostRecentCompany']) {
                return this.resume['mostRecentCompany'];
            }
            return null;
        },

        currentJobLevel() {
            if(this.resume && this.resume['currentJobLevel'] && this.resume['currentJobLevel']['name']) {
                return this.resume['currentJobLevel']['name'];
            }
            return null;
        },

        expectedJobTitle() {
            if(this.resume && this.resume['expectedJobTitle']) {
                return this.resume['expectedJobTitle'];
            }
            return null;
        },

        expectedJobLevel() {
            if(this.resume && this.resume['expectedJobLevel'] && this.resume['expectedJobLevel']['name']) {
                return this.resume['expectedJobLevel']['name'];
            }
            return null;
        },

        expectedLocation() {
            if(this.resume && this.resume['expectedLocation'] && this.resume['expectedLocation'].length > 0) {
                return this.resume['expectedLocation'].map((location) => {
                    return `${location.locationName}`;
                });
            }
            return null;
        },

        expectedIndustry() {
            if(this.resume && this.resume['expectedIndustry'] && this.resume['expectedIndustry'].length > 0) {
                return this.resume['expectedIndustry'].map((industry) => {
                    return `${industry.industryName}`;
                });
            }
            return null;
        },

        expectedSalary() {
            if(this.resume && this.resume['expectedSalary'] && this.resume['expectedSalary']) {
                return this.resume['expectedSalary'];
            }
            return null;
        },

        coverLetter() {
            if(this.application && this.application['coverLetter'] && this.application['coverLetter']) {
                return this.application['coverLetter'];
            }
            return null;
        },

        profileObjective() {
            if(this.resume && this.resume['profileObjective'] && this.resume['profileObjective']) {
                return this.resume['profileObjective'];
            }
            return null;
        },

        experiences() {
            if(this.resume && this.resume['experiences']) {
                return _.toArray(this.resume['experiences']);
            }
            return null;
        },

        educations() {
            if(this.resume && this.resume['educations']) {
                return _.toArray(this.resume['educations']);
            }
            return null;
        },

        references() {
            if(this.resume && this.resume['references']) {
                return _.toArray(this.resume['references']);
            }
            return null;
        },

        hasGeneralInfo() {
            return !_.isEmpty(this.highestDegree())
                || !_.isEmpty(this.yearsExperience())
                || !_.isEmpty(this.languageProficiency())
                || !_.isEmpty(this.mostRecentJobTitle())
                || !_.isEmpty(this.mostRecentCompany())
                || !_.isEmpty(this.currentJobLevel())
                || !_.isEmpty(this.expectedJobTitle())
                || !_.isEmpty(this.expectedJobLevel())
                || !_.isEmpty(this.expectedLocation())
                || !_.isEmpty(this.expectedIndustry())
                || !_.isEmpty(this.expectedSalary());
        },

        hasAttachment() {
            return this.application && this.application['attachmentPath'];
        },

        canViewAttachment() {
            if(this.application && this.application['fileName']) {
                const ex = this.application['fileName'].split('.');
                return ['zip', 'rar'].indexOf(ex[ex.length - 1]) < 0;
            }
            return false;
        },

        attachmentUrl() {
            if(this.application && this.application['attachmentPath']) {
                return this.application['attachmentPath'];
            }
            return null;
        },

        attachmentName() {
            if(this.application && this.application['fileName']) {
                return this.application['fileName'];
            }
            return null;
        },

        hasAvatar() {
            return this.resume.avatar && this.resume.avatar.trim().length > 0;
        },

        avatar() {
            if(this.resume && this.resume['avatar']) {
                return this.resume['avatar'];
            }
            return '';
        },

        appId() {
            return this.application.entryId;
        },

        appType() {
            return this.resume.methodPosted == 3 ? 1 : 2;
        }
    }
});


initResume = function (result = {resume: {}, application: {}}) {
    const details = new ResumeDetails(result);
    if(details.hasAvatar()) {
        Meteor.setTimeout(function() {
            Meteor.call('application.updateAvatar', details.appId(), details.appType() , details.avatar())
        }, 0);
    }
    return details;
};


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
            currentAppType: null,
            currentAppAction: null,
            relatedJobs: [],
            isResumeLoading: false,
            resume: null,
            isLoading: true,
            tabState: 1 // default
        };

        state = _.extend(state, JobApplications.getState());
        state = _.extend(state, JobCurrentApplication.getState());
        return state;
    },

    componentWillMount() {
	    this.checkPermission();
        this.trackers = [];
        this.trackers.push(Tracker.autorun(() => {
            const nextState = {};
            let {query, jobId, stage} = Router.current().params;
            let { candidateType, appId, appType, appAction } = query;

            const stageObj = _.findWhere(Success.APPLICATION_STAGES, {alias: stage});
            if (jobId) jobId = parseInt(jobId);
            if (appId) appId = parseInt(appId);
            if (appType) appType = parseInt(appType);
            if (candidateType) candidateType = parseInt(candidateType);
            if ([1, 2].indexOf(candidateType) < 0) candidateType = 1;

            if (!_.isEqual(stageObj, this.state.stage)) nextState['stage'] = stageObj;
            if (jobId != this.state.jobId) nextState['jobId'] = +jobId;
            if (candidateType != this.state.candidateType) nextState['candidateType'] = candidateType;
            if (appId != this.state.currentAppId) nextState['currentAppId'] = appId;
            if (appType != this.state.currentAppType) nextState['currentAppType'] = appType;
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
            //if(this.state.currentAppAction) {
            //    //this.setState({tabState: 1})
            //}
        }
    },

    componentWillUpdate(nextProps, nextState) {
        try {
            this.handle___UpdateAppCounter(nextState.candidateType, this.state.candidateType);
        } catch (e) {

        }
    },

    componentDidUpdate(prevProps, prevState) {
        if (this.state.currentAppId && this.state.currentAppId != prevState.currentAppId) {
            this.handle___GetResumeDetails();
            this.current__Actions().changeTab(1);
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

    checkPermission() {
		Meteor.defer(function() {
			checkAccessPermission({
				onFail() {
					Router.go('accessDenied');
				}
			});
		})
    },

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
        this.setState({
            isResumeLoading: true
        });
        Meteor.call('getResumeDetails', this.state.currentAppId, this.state.currentAppType, (err, result) => {
            if (!err, result) {
                const details = new ResumeDetails(result);
                this.setState({
                    isResumeLoading: false,
                    resume: details
                });

                if(details.hasAvatar()) {
                    Meteor.setTimeout(function() {
                        Meteor.call('application.updateAvatar', details.appId(), details.appType() , details.avatar())
                    }, 0);
                }
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

                        {this.state.isResumeLoading ? <div className="job-candidate-profile"><WaveLoading /></div> : (
                            <JobCandidateProfile
                                job={ this.state.job }
                                extra={ this.data.extra }
                                stage={ this.state.stage }
                                applicationId={ this.state.currentAppId }
                                resume={ this.state.resume }
                                appAction={ this.state.currentAppAction }
                                actions={ this.current__Actions() }
                                tabState={this.state.tabState}
                                onChangeTab={(tabState) => { this.setState({tabState}) }} />
                        )}

                        <Modal show={this.state.apps__showSendBulkMessage} bsSize={'large'} onHide={() =>{}}>
                            <Modal.Header>
                                <Modal.Title>Send bulk message</Modal.Title>
                            </Modal.Header>
                            {this.state.apps__showSendBulkMessage ? (
                                <MessageBox
                                    actions={ this.current__Actions() }
                                    appIds={this.state.apps__selectedItems}
                                    onSave={this.apps__Actions().sendMessage}
                                    onDiscard={() => this.apps__Actions().toggleSendMessage(false) }/>
                            ) : null}
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
        if (this.state.isLoading) {
            return <WaveLoading />;
        } else {
            if (this.data.extra && this.data.extra.syncState == 'ready') {
                return this.render__Syncing();
            } else {
                return this.render__Content();
            }
        }

    }
});