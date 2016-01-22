const RendererMixin = {};

JobCandidateResume = React.createClass({
    mixins: [RendererMixin],
    propTypes: {
        application: React.PropTypes.object.isRequired,
        resume: React.PropTypes.object
    },

    render() {
        if (_.isEmpty(this.props.resume)) return null;
        return <JobCandidateResumeOnline resume={this.props.resume} application={this.props.application}/>
    }
});

JobCandidateResumeOnline = React.createClass({
    propTypes: {
        application: React.PropTypes.object.isRequired,
        resume: React.PropTypes.object
    },


    getInitialState() {
        return {
            isViewCV: false,
            fullscreen: false
        };
    },

    componentDidUpdate(prevProps, prevState) {
        if (prevState.isViewCV != this.state.isViewCV && this.state.isViewCV === true) {
            let container = this.refs.resumeAttachment;
            let scrollTo = $(container).offset().top + 175;
            $('body').animate({
                scrollTop: scrollTo
            }, 'slow');

        }
    },

    toggleResumeViewer(status) {
        if (status === true) {
            this.setState({isViewCV: true});
        } else if (status === false) {
            this.setState({isViewCV: false, fullscreen: false});
        } else {
            this.setState({isViewCV: !this.state.isViewCV});
        }
    },
    toggleFullScreen(status) {
        if (status === true) {
            this.setState({fullscreen: true});
        } else if (status === false) {
            this.setState({fullscreen: false});
        } else {
            this.setState({fullscreen: !this.state.fullscreen});
        }
    },

    render() {
        const resume = this.props.resume;
        return (
            <div>
                {resume.hasGeneralInfo() && this.renderGeneralInfo(resume)}

                {resume.coverLetter() && (
                    <div className="row">
                        <div className="col-md-12">
                            <div className="ibox">
                                <div className="ibox-content">
                                    <h2><i className="fa fa-fw fa-quote-left hidden-print"></i> Cover Letter</h2>

                                    <blockquote>
                                        <pre className="cover-letter small"
                                             dangerouslySetInnerHTML={{__html: resume.coverLetter() }}/>
                                    </blockquote>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {resume.profileObjective() && (
                    <div className="row">
                        <div className="col-md-12">
                            <div className="ibox">
                                <div className="ibox-content">
                                    <h2><i className="fa fa-user"></i> Profile / Objective </h2>
                                    <blockquote>
                                        <pre className="cover-letter small"
                                             dangerouslySetInnerHTML={{ __html: resume.profileObjective() }}/>
                                    </blockquote>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {resume.educations() && resume.educations().length > 0 && (
                    <div className="row">
                        <div className="col-md-12">
                            <div className="ibox">
                                <div className="ibox-content">
                                    <h2><i className="fa fa-fw fa-graduation-cap"></i> Education &amp; Qualifications
                                    </h2>

                                    <div id="vertical-timeline"
                                         className="vertical-container dark-timeline vertical-timeline-content  no-margins">
                                        {resume.educations().map(this.renderEducation)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {resume.experiences() && resume.experiences().length > 0 && (
                    <div className="row">
                        <div className="col-md-12">
                            <div className="ibox">
                                <div className="ibox-content">
                                    <h2><i className="fa fa-fw fa-bank"></i> Work Experience</h2>

                                    <div id="vertical-timeline"
                                         className="vertical-container dark-timeline vertical-timeline-content  no-margins">
                                        {resume.experiences().map(this.renderExperience)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {resume.references() && resume.references().length > 0 && (
                    <div className="row">
                        <div className="col-md-12">
                            <div className="ibox">
                                <div className="ibox-content">
                                    <h2><i className="fa fa-fw fa-book"></i> References</h2>

                                    <div id="vertical-timeline"
                                         className="vertical-container dark-timeline vertical-timeline-content  no-margins">
                                        {resume.references().map(this.renderReference)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {resume.hasAttachment() && this.renderAttachment(resume)}

            </div>
        );
    },

    renderGeneralInfo(resume) {
        return (
            <div className="row">
                <div className="col-md-12">
                    <div className="ibox">
                        <div className="ibox-content">
                            <h2><i className="fa fa-fw fa-list"></i> General Information</h2>

                            <div className="row">
                                <div className="col-sm-12">
                                    <table className="table m-b-xs m-t">
                                        <tbody>
                                        {resume.highestDegree() && (
                                            <tr>
                                                <td>
                                                    <strong>Highest Education</strong>
                                                </td>
                                                <td>{ resume.highestDegree() }</td>
                                            </tr>
                                        )}

                                        {resume.yearsExperience() && (
                                            <tr>
                                                <td>
                                                    <strong>Total Years of Experience</strong>
                                                </td>
                                                <td>{ resume.yearsExperience() } years</td>
                                            </tr>
                                        )}

                                        {resume.languageProficiency() && (
                                            <tr>
                                                <td>
                                                    <strong>Language Proficiency</strong>
                                                </td>
                                                <td>
                                                    {resume.languageProficiency().map((name, key) => <p
                                                        key={key}>{ name }</p>)}
                                                </td>
                                            </tr>
                                        )}

                                        {resume.mostRecentJobTitle() && (
                                            <tr>
                                                <td>
                                                    <strong>Most Recent Job</strong>
                                                </td>
                                                <td>
                                                    <div>{ resume.mostRecentJobTitle() }</div>
                                                </td>
                                            </tr>
                                        )}

                                        {resume.mostRecentCompany() && (
                                            <tr>
                                                <td>
                                                    <strong>Most Recent Company</strong>
                                                </td>
                                                <td>
                                                    <div>{ resume.mostRecentCompany() }</div>
                                                </td>

                                            </tr>
                                        )}

                                        {resume.currentJobLevel() && (
                                            <tr>
                                                <td>
                                                    <strong>Current Job Level</strong>
                                                </td>
                                                <td>
                                                    { resume.currentJobLevel() }
                                                </td>
                                            </tr>
                                        )}

                                        {resume.expectedJobTitle() && (
                                            <tr>
                                                <td>
                                                    <strong>Expected Position</strong>
                                                </td>
                                                <td>
                                                    { resume.expectedJobTitle() }
                                                </td>
                                            </tr>
                                        )}

                                        {resume.expectedJobLevel() && (
                                            <tr>
                                                <td>
                                                    <strong>Expected Job Level</strong>
                                                </td>
                                                <td>
                                                    { resume.expectedJobLevel() }
                                                </td>
                                            </tr>
                                        )}

                                        {resume.expectedLocation() && (
                                            <tr>
                                                <td>
                                                    <strong>Expected Work Place</strong>
                                                </td>
                                                <td>
                                                    {resume.expectedLocation().map((name, key) => <p
                                                        key={key}>{ name }</p>)}
                                                </td>
                                            </tr>
                                        )}
                                        {resume.expectedIndustry() && (
                                            <tr>
                                                <td>
                                                    <strong>Expected Job Category</strong>
                                                </td>
                                                <td>
                                                    { resume.expectedIndustry().map((name, key) => <p
                                                        key={key}>{ name }</p>) }
                                                </td>
                                            </tr>
                                        )}
                                        {resume.expectedSalary() && (
                                            <tr>
                                                <td>
                                                    <strong>Expected Salary</strong>
                                                </td>
                                                <td>
                                                    { resume.expectedSalary() } USD
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    },

    renderExperience(exp, key) {
        return (
            <div className="vertical-timeline-block" key={key}>
                <div className="vertical-timeline-icon blue-bg">
                    <i className="fa fa-black-tie"></i>
                </div>
                <div className="vertical-timeline-content">
                    <h2>{ exp['jobTitle'] || '' }</h2>
                    <span>
                        <small>
                            { exp['jobLevel'] } at { exp['companyName'] } - { exp['industry'] }
                        </small>
                    </span>

                    <br/>

                    <span className="vertical-date m-t-n-xs">
                        <small>{ exp['startDate'] || '' } - { exp['endDate'] == '-0001' ? 'present' : exp['endDate'] }</small>
                    </span>

                    <br/>

                    <p className="small" dangerouslySetInnerHTML={{__html: exp.description}}/>
                </div>
            </div>
        );
    },

    renderEducation(edu, key) {
        return (
            <div className="vertical-timeline-block" key={key}>
                <div className="vertical-timeline-icon navy-bg">
                    <i className="fa fa-building"></i>
                </div>
                <div className="vertical-timeline-content">
                    <h2>
                        { edu['schoolName'] || '' }
                        { edu['major'] && (<small>- {edu['major'] }</small>) }
                    </h2>
                    <span className="vertical-date m-t-n-xs">
                        <small>{ edu['endDate'] || '' } - { edu['endDate'] || '' }</small>
                    </span>

                    <br/>

                    <p className="small" dangerouslySetInnerHTML={{__html: edu.description}}/>
                </div>
            </div>
        );
    },

    renderReference(ref, key) {
        return (
            <div className="vertical-timeline-block" key={key}>
                <div className="vertical-timeline-icon navy-bg">
                    <i className="fa fa-user"></i>
                </div>
                <div className="vertical-timeline-content">
                    <h2 className="m-b-xs">
                        { ref['fullName'] || '' }
                        <small>- { ref['jobTitle'] || '' } at <strong>{ ref['companyName'] || '' }</strong></small>
                    </h2>
                        <span>
                            Email: { ref['email'] || '' }
                            <br/>
                            Phone number: { ref['phone'] || '' }
                        </span>
                </div>
            </div>
        );
    },

    renderAttachment(resume) {
        const attachmentUrl = `https://docs.google.com/viewer?embedded=true&url=${resume.attachmentUrl()}`;

        const viewerClass = classNames(
            'attachment-viewer',
            {
                fullscreen: this.state.fullscreen
            }
        );

        let viewButtons = null;
        if(resume.canViewAttachment()) {
            if (!this.state.isViewCV) {
                viewButtons = (
                    <button type="button" className="btn btn-primary btn-outline m-t-sm"
                            onClick={() => this.toggleResumeViewer(true) }>
                        <i className="fa fa-fw fa-eye"></i> Preview by Google Viewer
                    </button>
                );
            } else {
                viewButtons = (
                    <span>
                    <button type="button" className="btn btn-primary btn-outline m-t-sm"
                            onClick={() => this.toggleFullScreen(true) }>
                        <i className="fa fa-fw fa-arrows-alt"></i> Fullscreen
                    </button>
                        &nbsp;&nbsp;
                        <button type="button" className="btn btn-primary btn-outline m-t-sm"
                                onClick={() => this.toggleResumeViewer(false) }>
                            <i className="fa fa-fw fa-eye-slash"></i> Hide
                        </button>
                </span>
                );
            }
        }

        return (
            <div className="ibox hidden-print" ref="resumeAttachment">
                <div className="ibox-content">
                    <h2><i className="fa fa-fw fa-paperclip"></i> Attached CV</h2>

                    <div className="center-block text-center">

                        <span className="fa fa-file-pdf-o big-icon"></span><br />

                        <div className="text-center">
                            {viewButtons}
                            &nbsp;&nbsp;
                            <a className="btn btn-primary btn-outline m-t-sm" href={resume.attachmentUrl()} download={resume.attachmentUrl()}
                               target="_blank">
                                <i className="fa fa-fw fa-download"></i>
                                <span> Download CV</span>
                            </a>
                        </div>

                        {this.state.isViewCV ? (
                            <div className={viewerClass}>
                                <iframe src={attachmentUrl} frameBorder="0"></iframe>
                                {this.state.fullscreen ? (
                                    <button type="button" className="btn btn-primary m-t-sm exit-fullscreen"
                                            onClick={() => this.toggleResumeViewer(false) }>
                                        <i className="fa fa-fw fa-eye-slash"></i> Exit
                                    </button>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }
});