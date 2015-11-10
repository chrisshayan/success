Sub1 = new SubsManager({
    cacheLimit: 100,
    expireIn: 10
});

Sub2 = new SubsManager({
    cacheLimit: 100,
    expireIn: 10
});

Sub3 = new SubsManager({
    cacheLimit: 100,
    expireIn: 10
});


JobsContainer = React.createClass({
    render() {
        let styles = {
            jobsContainer: {
                padding: '20px 0 60px 0',
                overflow: 'auto',
                clear: 'both'
            }
        };
        /**
         * render 3 job lists
         *
         */
        return (
            <div className="row">
                <div className="col-md-12">
                    <PageHeading title="My Jobs" breadcrumb={[]}>
                        <a href="/job-settings" className="btn btn-primary btn-outline">
                            <i className="fa fa-plus"></i>&nbsp;
                            Add new position
                        </a>
                    </PageHeading>

                    <div style={styles.jobsContainer}>
                        <JobList
                            status={1}
                            source={"recruit"}
                            title={"CUSTOM POSITIONS"}
                            icon="fa-cloud"
                            emptyMsg="There is no position here."
                            subCache={Sub1}
                            />

                        <JobList
                            status={1}
                            source="vnw"
                            title="PUBLISHED POSITIONS"
                            icon="fa-cloud"
                            emptyMsg="There is no position here."
                            subCache={Sub2}
                            />

                        <JobList
                            status={0}
                            source="vnw"
                            title="CLOSED POSITIONS"
                            icon="fa-archive"
                            emptyMsg="Positions that no longer accepting new applicants will appear here."
                            subCache={Sub3}
                            />

                    </div>
                </div>
            </div>
        );
    }
});

/**
 * status=1
 * source="recruit"
 * title="CUSTOM POSITIONS"
 * icon="fa-cloud"
 * emptyMessage="There is no position here."
 */
JobList = React.createClass({
    propsType: {
        status: React.PropTypes.number,
        source: React.PropTypes.string,
        title: React.PropTypes.string,
        icon: React.PropTypes.string,
        emptyMsg: React.PropTypes.string
    },

    getInitialState() {
        return {
            inc: 5,
            limit: 5,
            total: 0
        };
    },

    mixins: [ReactMeteorData],
    getMeteorData() {
        /**
         * get jobs follow source and status
         * get ready state
         * get job count -> count by handshake
         */
        let subData = [this.filters(), this.options()];
        let isReady = this.props.subCache.subscribe('getJobs', ...subData).ready();
        return {
            isReady: isReady,
            jobs: Collections.Jobs.find(...subData).fetch()
        };
    },

    componentDidMount() {
        Meteor.call('jobListCounter', this.filters(), (err, total) => {
            if (!err) {
                if (this.state.total != total) {
                    this.setState({total: total})
                }
            }
        });
    },

    componentDidUpdate() {
        Meteor.call('jobListCounter', this.filters(), (err, total) => {
            if (!err) {
                if (this.state.total != total) {
                    this.setState({total: total})
                }
            }
        });
    },

    filters() {
        var filters = {
            status: this.props.status
        };

        if (this.props.source) {
            filters['source'] = this.props.source;
        }

        var tags = Session.get('jobFilterTags') || [];
        if (tags.length > 0) {
            filters['$or'] = [
                {
                    title: {
                        $regex: '(' + tags.join('|') + ')',
                        $options: 'i'
                    }
                },
                {
                    tags: {
                        $regex: '(' + tags.join('|') + ')',
                        $options: 'i'
                    }
                }
            ];
        }
        return filters;
    },

    options() {
        return {
            limit: this.state.limit,
            sort: {
                "createdAt": -1
            }
        };
    },

    handleLoadMore() {
        this.setState({
            limit: this.state.limit + this.state.inc
        });
    },

    render() {
        let content = null,
            loadingIcon = null,
            loadmoreBtn = null,
            isEmpty = this.data.isReady && _.isEmpty(this.data.jobs);

        if (!this.data.isReady) {
            loadingIcon = <WaveLoading />
        }

        if (this.state.total > this.state.limit) {
            loadmoreBtn = (
                <div>
                    <button
                        className={['btn','btn-small','btn-primary','btn-block'].join(' ')}
                        onClick={this.handleLoadMore}>
                        Load more
                    </button>
                </div>
            );
        }

        var styles = {
            container: {
                overflow: 'auto',
                clear: 'both',
                margin: '20px auto 40px auto'
            }
        };
        return (
            <div style={styles.container}>
                <div className="col-md-12">
                    <h3>
                        <i className={"fa " + this.props.icon}></i>&nbsp;
                        {this.props.title} ({this.state.total})
                    </h3>

                    <div className="jobs-list">
                        {isEmpty ? <JobListEmpty emptyMsg={this.props.emptyMsg}/> : this.renderJobs()}
                        {loadingIcon}
                        {loadmoreBtn}
                    </div>
                </div>
            </div>
        );
    },

    renderJobs() {
        return (
            <div>
                {this.data.jobs.map((data, key)=> {
                    return <Job job={data} key={key}/>
                })}
            </div>
        );
    }
});

JobListEmpty = React.createClass({
    propsType: {
        emptyMsg: React.PropTypes.string
    },
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
        job: React.PropTypes.object
    },

    getInitialState() {
        return {
            stages: _.toArray(Success.APPLICATION_STAGES)
        };
    },

    title() {
        return this.props.job.title;
    },

    from() {
        let createdAt = new moment(this.props.job.createdAt);

        return createdAt.calendar()
    },

    to() {
        if (!this.props.job['expiredAt']) return '∞';
        let expiredAt = new moment(this.props.job.expiredAt);
        return expiredAt.calendar()
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

    handleSelectTag(tag) {
        var jobId = this.props.job._id;
        var tags = this.props.job.tags || [];
        tags.push(tag.skillName);
        tags = _.unique(tags);
        Meteor.call('updateJobTags', jobId, tags);
    },

    handleRemoveLastTag() {
        var jobId = this.props.job._id;
        var tags = this.props.job.tags || [];
        if (!_.isEmpty(tags)) {
            tags.pop();
            tags = _.unique(tags);
        }
        Meteor.call('updateJobTags', jobId, tags);
    },

    handleRemoveTag(tag) {
        let jobId = this.props.job._id,
            tags = this.props.job.tags;
        tags = _.without(tags, tag);
        Meteor.call('updateJobTags', jobId, tags);
    },

    render() {
        let styles = {
            tags: {
                height: '34px',
                lineHeight: '34px',
                display: 'inline-block',
                overflow: 'auto'
            },
            tagsInput: {
                float: "left",
                width: "40%",
                minWidth: "185px",
                border: "none",
                backgroundColor: "rgba(0, 0, 0, 0)",
                outline: "none",
                paddingLeft: "5px"
            }
        };
        return (
            <div className="job">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <div className="panel-title clearfix">
                            <h3 className="pull-left job-title">
                                <a href={this.link('applied')}>
                                    {this.props.job.title}
                                </a>
                                &nbsp;
                                <a href={this.settingsLink()} className="btn btn-white btn-xs">
                                    <i className="fa fa-cogs"></i>
                                </a>

                            </h3>

                            <span className="pull-right job-posted-timeago">
                                From {this.from()}
                                &nbsp;
                                to {this.to()}
                            </span>
                        </div>
                    </div>
                    <div className="job-stages">
                        <div className="row">
                            {this.state.stages.map(this.renderStage)}
                        </div>
                    </div>
                    <div className="panel-footer job-tags-box">
                        <div className="panel-title clearfix">
                            <div style={styles.tags}>
                                {this.props.job.tags && this.props.job.tags.map(this.renderTag)}
                            </div>
                            <TagsInput
                                onSelect={this.handleSelectTag}
                                onRemoveLastTag={this.handleRemoveLastTag}
                                placeholder={"click to add labels to your job"}
                                style={styles.tagsInput}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    renderStage(stage, key) {
        var stages = this.props.job['stages'] || null;
        var stageCount = stages && stages[key] ? stages[key] : '-';
        return (
            <div className="col-sm-2 stage stage-" key={key}>
                <a href={this.link(stage.alias)} className="stage-number">{stageCount}</a>
                <a href={this.link(stage.alias)} className="stage-label">{stage.label}</a>
            </div>
        );
    },

    renderTag(tag, key) {
        var styles = {
            tag: {
                marginRight: '3px'
            },
            closeBtn: {
                cursor: 'pointer'
            }
        };
        return (
            <span
                className="label"
                key={key}
                style={styles.tag}>
                {tag} &nbsp;
                <span
                    onClick={() => {this.handleRemoveTag(tag)}}
                    style={styles.closeBtn}>
                    x
                </span>
            </span>
        );
    }
});