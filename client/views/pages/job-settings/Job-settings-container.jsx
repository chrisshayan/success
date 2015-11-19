const {Tabs, Tab} = ReactBootstrap;
JobSettingsContainer = React.createClass({
    getInitialState() {
        return {
            breadcrumb: [
                {label: 'Home', route: '/dashboard'},
                {label: '[Current job title]', route: null}
            ],
            currentTab: 1,
            jobId: null
        };
    },

    componentWillMount() {
        const params = Router.current().params;
        this.setState({jobId: +params.jobId});
    },

    handleSelect(key) {
        this.setState({currentTab: key});
    },

    render() {
        return (
            <div>
                <PageHeading title="Job settings" breadcrumb={this.state.breadcrumb} />
                <div className="wrapper wrapper-content">
                    <div className="row">
                        <div className="tabs-container">
                            <div className="tabs-left">
                                <ul className="nav nav-tabs">
                                    <li className="active">
                                        <a id="job_tab" data-toggle="tab" href="#job" aria-expanded="true">
                                            <h3>
                                                <span className="circle-wrapper"><i className="fa fa-fw fa-suitcase"></i></span>
                                                <span className="hidden-xs hidden-sm">THE JOB</span>
                                            </h3>
                                            <p className="hidden-xs hidden-sm">Tell applicants what the job involves and why it's great opportunity.</p>
                                        </a>
                                    </li>

                                    <li>
                                        <a id="criteria_tab" data-toggle="tab" href="#hiring-criteria" aria-expanded="true">
                                            <h3>
                                                <span className="circle-wrapper"><i className="fa fa-fw fa-filter"></i></span>
                                                <span className="hidden-xs hidden-sm">HIRING CRITERIA</span>
                                            </h3>
                                            <p className="hidden-xs hidden-sm">Tell applicants what the job involves and why it's great opportunity.</p>
                                        </a>
                                    </li>

                                    <li>
                                        <a id="hiring_team_tab" data-toggle="tab" href="#hiring-team" aria-expanded="true">
                                            <h3>
                                                <span className="circle-wrapper"><i className="fa fa-fw fa-users"></i></span>
                                                <span className="hidden-xs hidden-sm">HIRING TEAM</span>
                                            </h3>
                                            <p className="hidden-xs hidden-sm">Tell applicants what the job involves and why it's great opportunity.</p>
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
                                                            <span className="circle-wrapper"><i className="fa fa-briefcase"></i></span>
                                                            The Job
                                                        </h2>

                                                        <JobDetails jobId={this.state.jobId}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tab-pane" id="hiring-criteria">
                                        <div className="panel-body">
                                            <div className="col-sm-10">
                                                <div className="float-e-margins animated fadeInRight">
                                                    <div className="content">
                                                        <h2>
                                                            <span className="circle-wrapper"><i className="fa fa-filter"></i></span>
                                                            Hiring Criteria
                                                        </h2>


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