let {
    DropdownButton,
    MenuItem
    } = ReactBootstrap;


JobHeader = React.createClass({
    propTypes: {
        job: React.PropTypes.object.isRequired
    },

    jobSettingUrl() {
        return Router.url('JobSettings', {
            jobId: this.props.job.jobId
        });
    },

    render() {
        let styles = {
            title: {
                fontSize: '24px',
                fontWeight: 100,
                margin: '5px 0 0 0',
                padding: 0,
                float: 'left'
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
                <div className="col-lg-12">
                    <div className="clearfix">
                        <h2 id="jobSwitch" style={styles.title}>{this.props.job.jobTitle}</h2>

                        <a href={this.jobSettingUrl()} className="btn btn-link pull-left">
                            <i className="fa fa-cogs" /> &nbsp;
                            setting
                        </a>
                    </div>
                </div>

                <div className="col-md-12">
                    <div style={{paddingBottom: '10px'}}>
                        {this.props.job.skills && this.props.job.skills.map(this.renderTag)}
                    </div>
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

    renderTag(skill, key) {
        return <span key={key} className="tag-item">{ skill.skillName }</span>;
    }
});