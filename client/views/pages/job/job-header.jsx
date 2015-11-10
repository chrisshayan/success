let {
    DropdownButton,
    MenuItem
    } = ReactBootstrap;


JobHeader = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        job: React.PropTypes.object.isRequired
    },

    getMeteorData() {
        let job = this.props.job;
        let filter = {
            _id: {$ne: job._id},
            status: job.status
        };
        let opt = {
            limit: 5,
            sort: {
                createdAt: -1
            }
        };
        return {
            relatedJobs: Collections.Jobs.find(filter, opt).fetch()
        };
    },

    currentJobTitle() {
        return this.props.job.title || '';
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

    jobSettingUrl() {
        return Router.url('teamSettings', {
            jobId: this.props.job._id
        });
    },

    render() {
        let styles = {
            title: {
                fontSize: '24px',
                fontWeight: 100,
                margin: '5px 0 0 0',
                padding: 0
            },

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
            },

            actions: {
                margin: '10px 0 0 0'
            }
        };

        return (
            <div className="row wrapper border-bottom white-bg">
                <div className="col-lg-6">
                    <DropdownButton
                        id="jobSwitch"
                        bsStyle={'link'}
                        style={styles.title}
                        title={ this.currentJobTitle() }
                        key={0}>

                        { this.data.relatedJobs.map(this.renderRelatedJobs) }

                    </DropdownButton>

                    <a href={this.jobSettingUrl()} className="btn btn-link">
                        <i className="fa fa-cogs" /> &nbsp;
                        setting
                    </a>
                </div>

                <div className="col-lg-6 text-right ">
                    <div style={styles.actions} className="hidden">
                        <a href="#" className="btn btn-primary btn-outline">
                            <i className="fa fa-plus"></i>&nbsp;
                            Add candidate
                        </a>
                    </div>
                </div>

                <div className="col-md-12">
                    <div style={styles.tags}>
                        {this.props.job.tags && this.props.job.tags.map(this.renderTag)}
                    </div>

                    <TagsInput
                        onSelect={this.handleSelectTag}
                        onRemoveLastTag={this.handleRemoveLastTag}
                        placeholder={"click to add labels to your job"}
                        style={styles.tagsInput} />
                </div>
            </div>
        );
    },

    renderRelatedJobs(job, key) {
        let styles = {
            relatedTitle: {
                fontSize: '15px !important'
            }
        };
        let jobUrl = Router.url('Job', {_id: job._id, stage: 'applied'});
        return <MenuItem key={key} eventKey={key} style={styles.relatedTitle} href={jobUrl}> {job.title} </MenuItem>
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
            <span className="label" key={key} style={styles.tag}>
                {tag} &nbsp;
                <span onClick={() => {this.handleRemoveTag(tag)}} style={styles.closeBtn}>
                    x
                </span>
            </span>
        );
    }
});