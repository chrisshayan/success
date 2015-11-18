const ESCollection = new Mongo.Collection('es_jobs');
const SubCache = new SubsManager();

const ComponentState = function () {
    return {
        forceUpdate: false,
        inc: 10,
        limit: 10,
        counter: {
            online: 0,
            expired: 0
        },
        q: '',
        isSearching: false
    };
};

const HookMixin = {

    componentWillMount() {
        this.getJobTypeCount();
    },

    componentWillUpdate(nextProps, nextState) {
        if (nextState.forceUpdate != this.state.forceUpdate) {
            this.getJobTypeCount();
        }
    }
};

const ActionMixin = {
    handle___HandShake(e) {
        e.preventDefault();
        this.setState({
            forceUpdate: !this.state.forceUpdate
        });
    },
    handle___LoadMore(e) {
        e.preventDefault();
        this.setState({
            limit: this.state.limit + this.state.inc
        });
    },

    handle___ChangeType(type) {
        this.setState({
            limit: this.state.inc,
            q: '',
            isSearching: false
        });
        Router.go('dashboard', {}, {query: {type: type}});
    },

    handle___Search(e) {
        e.preventDefault();
        this.setState({q: e.target.value});
    }
};

const RendererMixin = {
    render__JobTypes(currentType, counter) {
        const types = [
            {name: 'Online', alias: 'online'},
            {name: 'Expired', alias: 'expired'}
        ];
        const menu = [];
        types.map((t, k) => {

            let cx = classNames('btn', 'btn-sm', 'btn-rounded', {
                'btn-primary': currentType == t.alias
            }, {
                'btn-default': currentType != t.alias
            });
            menu.push((
                <span key={k}>
                    <a href="#" onClick={() => this.handle___ChangeType(t.alias)} className={cx}>
                        {t.name}
                        &nbsp;
                        ({counter[t.alias]})
                    </a>
                    &nbsp;
                </span>
            ));
        });
        return menu;
    }
};

const HelperMixin = {
    getJobTypeCount() {
        Meteor.call('jobListCount', (err, result) => {
            if (!err) {
                this.setState({
                    counter: result
                })
            }
        });
    },

    total() {
        if (this.state.q.length > 0) {
            const filter = this.jobFilter(this.data.currentType);
            return ESCollection.find(filter).count();
        }
        return this.state.counter[this.data.currentType];
    },

    jobFilter(currentType) {
        const q = this.state.q;
        const filter = {
            type: currentType
        };
        if (q.length > 0) {
            filter['$or'] = [
                {
                    jobTitle: {
                        $regex: q,
                        $options: 'i'
                    }
                },
                {
                    "skills.skillName": {
                        $regex: q,
                        $options: 'i'
                    }
                },
            ];
        }
        return filter;
    },

    fetchJobs(currentType) {
        const filter = this.jobFilter(currentType);
        const option = {
            limit: this.state.limit,
            sort: {jobId: -1}
        };
        return ESCollection.find(filter, option).fetch();
    }
};

JobsContainer = React.createClass({
    mixins: [ReactMeteorData, HookMixin, ActionMixin, RendererMixin, HelperMixin],
    getInitialState() {
        return ComponentState();
    },

    getMeteorData() {
        const forceUpdate = this.state.forceUpdate;
        const params = Router.current().params;
        let currentType = 'online';
        if (params.query && params.query['type']) {
            if (['online', 'expired'].indexOf(params.query['type']) >= 0) {
                currentType = params.query['type'];
            }
        }
        const sub = SubCache.subscribe('ESJobs', currentType, this.state.limit, this.state.q, forceUpdate);
        return {
            currentType: currentType,
            isReady: sub.ready(),
            jobs: this.fetchJobs(currentType)
        };
    },


    render() {
        let pageTitle = (
            <span>
                <span style={{color: "#1AB394"}}>
                    <i className="fa fa-cloud"/>
                </span>&nbsp;
                My online jobs
            </span>
        );
        if (this.data.currentType == "expired") {
            pageTitle = (
                <span>
                    <i className="fa fa-archive"/>&nbsp;
                    My expired jobs
                </span>
            );
        }
        let loadMoreBtn = null,
            loadingIcon = null,
            isEmpty = this.total() === 0;

        if (!this.data.isReady) {
            loadingIcon = <WaveLoading />
        }

        if (this.total() > this.state.limit) {
            loadMoreBtn = (
                <div>
                    <button
                        className={['btn','btn-small','btn-primary','btn-block'].join(' ')}
                        onClick={this.handle___LoadMore}>
                        <i className="fa fa-arrow-down"/>&nbsp;
                        Load more
                    </button>
                </div>
            );
        }
        return (
            <div className="row" style={{paddingBottom: '60px'}}>
                <PageHeading title={pageTitle} breadcrumb={[]}/>

                <div className="animated fadeInUp">
                    <div className="ibox-content m-b-sm border-bottom">
                        <div className="row">
                            <div className="col-md-3">
                                {this.render__JobTypes(this.data.currentType, this.state.counter)}
                            </div>
                            <div className="col-md-1">
                                <button type="button" className="btn btn-white btn-sm"
                                        onClick={this.handle___HandShake}>
                                    <i className="fa fa-refresh"/>&nbsp;
                                    Refresh
                                </button>
                            </div>

                            <div className="col-md-8">
                                <div className="input-group">
                                    <input type="text" placeholder="Search" className="input-sm form-control"
                                           onKeyUp={this.handle___Search}/>
                                    <span className="input-group-btn">
                                        <button type="button" className="btn btn-sm btn-primary"> Go!</button>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <JobList jobs={this.data.jobs}/>

                <div className="col-md-12">
                    {isEmpty ? <JobListEmpty /> : null}
                    {loadingIcon}
                    {loadMoreBtn}
                </div>
            </div>
        );
    }
});

JobList = React.createClass({

    getInitialState() {
        return {
            title: 'PUBLISHED POSITIONS',
            icon: 'fa-cloud',
            emptyMsg: 'There is no position here.',

        };
    },

    render() {
        return (
            <div className="col-md-12">
                <div className="jobs-list">
                    {this.props.jobs.map((job, k) => <Job job={job} key={k}/>)}
                </div>
            </div>
        );
    }
});

JobListEmpty = React.createClass({
    getDefaultProps() {
        return {
            emptyMsg: 'There is no position here.'
        };
    },
    render() {
        return (
            <div className="empty-jobs">
                <h3 className="empty-message">{this.props.emptyMsg}</h3>
            </div>
        );
    }
});

WaveLoading = React.createClass({
    render() {
        let styles = {
            container: {},
            wave: {
                margin: '0 1px !important'
            }
        };
        return (
            <div style={styles.container}>
                <div className="sk-spinner sk-spinner-wave">
                    <div className="sk-rect1" style={styles.wave}></div>
                    <div className="sk-rect2" style={styles.wave}></div>
                    <div className="sk-rect3" style={styles.wave}></div>
                    <div className="sk-rect4" style={styles.wave}></div>
                    <div className="sk-rect5" style={styles.wave}></div>
                </div>
            </div>
        );
    }
});

Job = React.createClass({
    propsType: {
        job: React.PropTypes.object.isRequired
    },

    getInitialState() {
        return {
            stages: _.toArray(Success.APPLICATION_STAGES)
        };
    },

    title() {
        let title = '';
        const job = this.props.job;
        if (job) {
            if (job && job['jobTitle']) title = job.jobTitle;
        }
        return title;
    },

    cities() {
        let cities = [];
        const job = this.props.job;
        if (job.cities) {
            _.each(job.cities, (c) => {
                if (c && c.name) cities.push(c.name);
            });
        }
        return cities.join(', ');
    },

    duration() {
        let times = [];
        const job = this.props.job;
        const createdAt = new moment(job.approvedDate);
        const expiredAt = new moment(job.expiredDate);
        if (createdAt.isValid()) {
            times.push(createdAt.calendar());
        }
        if (expiredAt.isValid()) {
            times.push(expiredAt.calendar());
        }
        return times.join(' to ');
    },

    link(stage) {
        var params = {
            _id: this.props.job._id,
            stage: stage
        };
        return Router.url('Job', params);
    },

    settingsLink() {
        var params = {
            jobId: this.props.job._id
        };
        return Router.url('teamSettings', params);
    },

    render() {
        return (
            <div className="job">
                <div className="faq-item">
                    <div className="row">
                        <div className="col-md-7">
                            <a href="#" className="faq-question">
                                {this.title()}
                            </a>
                            <div>
                                <span>ID: {this.props.job.jobId}</span>
                                &nbsp;|&nbsp;
                                <a href={this.settingsLink()} className="btn btn-xs btn-link">
                                    <i className="fa fa-cogs" />&nbsp;
                                    Settings
                                </a>
                            </div>
                        </div>
                        <div className="col-md-5 text-right info">
                            <div>
                                {this.cities()}&nbsp;
                                <i className="fa fa-map-marker"/>
                            </div>
                            <div>
                                { this.duration() }&nbsp;
                                <i className="fa fa-globe"/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="job-stages">
                    <div className="row">
                        {this.state.stages.map(this.renderStage)}
                    </div>
                </div>
                <div className="tag-list">
                    {this.props.job.skills.map(this.renderTag)}
                </div>
            </div>
        );
    },

    renderStage(stage, key) {
        var extra = this.props.job['extra'] || {};
        var stages = extra['stage'] || null;
        var stageCount = stages && stages[stage.alias] ? stages[stage.alias] : '-';
        var className = classNames('stage', `stage-${stage.alias}`)
        return (
            <div className={className} key={key}>
                <a href={this.link(stage.alias)} className="stage-number">{stageCount}</a>
                <a href={this.link(stage.alias)} className="stage-label">{stage.label}</a>
            </div>
        );
    },

    renderTag(tag, key) {
        var name = '';
        if (tag['skillName']) {
            name = tag['skillName'];
        }
        return <span key={key} className="tag-item">{name}</span>;
    }
});