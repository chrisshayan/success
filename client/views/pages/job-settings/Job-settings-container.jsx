JobSettingsContainer = React.createClass({
    mixins: [ReactMeteorData],

    getInitialState() {
        return {
            breadcrumb: [
                {label: 'Home', route: '/dashboard'}
            ],
            jobTitle: '',
            currentTab: 1
        };
    },

    getMeteorData() {
        const params = Router.current().params;
        const jobId = +params['jobId'];
        let isReady = true,
            extra = new JobExtra();

        if (params['jobId']) {
            const sub = Meteor.subscribe('JobExtra', jobId);
            isReady = sub.ready();
            if (isReady) {
                extra = JobExtra.getCollection().findOne({jobId: jobId});
            }
        }
        return {
            isReady: isReady,
            jobId: jobId,
            extra: extra
        };
    },

    handle___ChangeTab(key) {
        this.setState({currentTab: key});
    },

    handle___JobLoaded(job) {
        this.setState({jobTitle: job.jobTitle});
    },

    ATSLink() {
        if (!this.data.jobId) return '';
        return Router.url('Job', {
            jobId: this.data.jobId,
            stage: 'applied'
        });
    },

    render() {
        return (
            <div>
                <PageHeading
                    title="Job settings"
                    breadcrumb={this.state.breadcrumb.concat({label: this.state.jobTitle, route: null})}>

                    <a href={ this.ATSLink() } className="btn btn-primary btn-outline">
                        <i className="fa fa-file-text-o"/>&nbsp;
                        Manage applications
                    </a>

                </PageHeading>

                <div className="wrapper wrapper-content">
                    <div className="row">
                        <div className="tabs-container">
                            <div className="tabs-left">
                                <ul className="nav nav-tabs">
                                    <li className="active">
                                        <a id="job_tab" data-toggle="tab" href="#job" aria-expanded="true">
                                            <h3>
                                                <span className="circle-wrapper"><i
                                                    className="fa fa-fw fa-suitcase"></i></span>
                                                <span className="hidden-xs hidden-sm">THE JOB</span>
                                            </h3>
                                            <p className="hidden-xs hidden-sm">Tell applicants what the job involves and
                                                why it's great opportunity.</p>
                                        </a>
                                    </li>

                                    <li>
                                        <a id="criteria_tab" data-toggle="tab" href="#hiring-criteria"
                                           aria-expanded="true">
                                            <h3>
                                                <span className="circle-wrapper"><i className="fa fa-fw fa-filter"></i></span>
                                                <span className="hidden-xs hidden-sm">HIRING CRITERIA</span>
                                            </h3>
                                            <p className="hidden-xs hidden-sm">Figuring out exactly who you’re looking for.</p>
                                        </a>
                                    </li>

                                    <li>
                                        <a id="hiring_team_tab" data-toggle="tab" href="#hiring-team"
                                           aria-expanded="true">
                                            <h3>
                                                <span className="circle-wrapper"><i
                                                    className="fa fa-fw fa-users"></i></span>
                                                <span className="hidden-xs hidden-sm">HIRING TEAM</span>
                                            </h3>
                                            <p className="hidden-xs hidden-sm">Are typically the head of their respective departments, and the person to whom the new hire will directly report.</p>
                                        </a>
                                    </li>
                                </ul>

                                <div className="tab-content">
                                    <div className="tab-pane active" id="job">
                                        <div className="panel-body">
                                            <div className="col-sm-10">
                                                <div className="float-e-margins animated fadeInRight">
                                                    <div className="content">
                                                        <h2>
                                                            <span className="circle-wrapper">
                                                                <i className="fa fa-briefcase"></i>
                                                            </span>
                                                            The Job
                                                        </h2>

                                                        <JobDetails jobId={this.data.jobId}
                                                                    onJobLoaded={this.handle___JobLoaded}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tab-pane" id="hiring-criteria">
                                        <div className="panel-body">
                                            <div className="col-sm-12">
                                                <div className="float-e-margins animated fadeInRight">
                                                    <div className="content">
                                                        <h2>
                                                            <span className="circle-wrapper"><i
                                                                className="fa fa-filter"></i></span>
                                                            Hiring Criteria
                                                        </h2>

                                                        <HiringCriteriaContainer
                                                            jobId={this.data.jobId}
                                                            hiringCriteria={this.data.extra.hiringCriteria}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tab-pane" id="hiring-team">
                                        <div className="panel-body">
                                            <div className="col-sm-10">
                                                <div className="float-e-margins animated fadeInRight">
                                                    <div className="content">
                                                        <JobHiringTeam jobId={this.data.jobId}
                                                                       recruiters={this.data.extra.recruiters}/>
                                                    </div>
                                                </div>
                                            </div>
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