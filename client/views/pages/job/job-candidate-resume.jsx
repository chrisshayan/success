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
            let container = this.refs.resumeAttachment.getDOMNode();
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
                <div className="row">
                    <div className="col-md-6">
                        <div className="ibox">
                            <div className="ibox-content">
                                <h2><i className="fa fa-fw fa-list"></i> General Information</h2>

                                <div className="row">
                                    <div className="col-sm-12">
                                        <table className="table m-b-xs m-t">
                                            <tbody>
                                            <tr>
                                                <td>
                                                    <strong>Total Years of Experience</strong>
                                                </td>
                                                <td>{ resume.yearOfExperience }</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Most Recent Job</strong>
                                                </td>
                                                <td>
                                                    { resume.currentJobLevel }
                                                </td>

                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Most Recent Company</strong>
                                                </td>
                                                <td>
                                                    { resume.recentCompany }
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Current Job Level</strong>
                                                </td>
                                                <td>
                                                    { resume.currentJobLevel }
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="ibox">
                            <div className="">
                                <h2><i className="fa fa-fw fa-quote-left hidden-print"></i> Cover Letter</h2>

                                <blockquote>
                                    <p className="small"
                                       dangerouslySetInnerHTML={{__html: resume.coverLetter}}/>
                                </blockquote>
                            </div>
                        </div>
                    </div>
                </div>

                {resume && resume['careerObjective'] ? (
                    <div className="row">
                        <div className="col-md-12">
                            <div className="ibox">
                                <div className="ibox-content">
                                    <h2><i className="fa fa-dot-circle-o"></i> Career Objective </h2>
                                    <blockquote>
                                        <p dangerouslySetInnerHTML={{ __html: resume.careerObjective }}/>
                                    </blockquote>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null }

                {resume && resume['experience'] ? (
                    <div className="row">
                        <div className="col-md-7">
                            <div className="ibox">
                                <div className="ibox-content">
                                    <h2><i className="fa  fa-file-text-o"/>&nbsp;EXPERIENCE</h2>
                                    <ul className="content-list">
                                        {resume.experience && resume.experience.map(this.renderExperience)}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-5">
                            <div className="ibox">
                                <div className="ibox-content">
                                    <h2><i className="fa  fa-trophy"/>&nbsp;EDUCATION</h2>
                                    <ul className="content-list">
                                        {resume.education && resume.education.map(this.renderEducation)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null }

                {resume && resume['reference'] ? (
                    <div className="row">
                        <div className="col-md-12">
                            <div className="ibox">
                                <div className="ibox-content">
                                    <h2><i className="fa fa-book"></i> References</h2>

                                    <div id="vertical-timeline"
                                         className="vertical-container dark-timeline vertical-timeline-content no-margins">

                                        {resume.reference && resume.reference.map(this.renderReference)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null }

                {resume && resume['attachment'] ? this.renderAttachment(resume.attachment) : null}
            </div>
        );
    },

    renderExperience(exp, key) {
        return (
            <li className="list-item" key={key}>
                <span className="list-item-icon">
                    <i className="fa fa-circle-o"/>
                </span>
                <span className="list-item-text">
                    <strong>{ exp.position }</strong> at <strong>{ exp.company }</strong>
                    <span className="list-item-info">
                        <span className="list-item-date">{ exp.start } - { exp.end }</span>
                        <p className="small"
                           dangerouslySetInnerHTML={{__html: exp.description}}/>
                    </span>
                </span>
            </li>
        );
    },

    renderEducation(edu, key) {
        return (
            <li className="list-item" key={key}>
                <span className="list-item-icon">
                    <i className="fa fa-circle-o"/>
                </span>
                <span className="list-item-text">
                    <strong>{ edu.major }</strong> at <strong>{ edu.school }</strong>
                    <span className="list-item-info">
                        <span className="list-item-date">{ edu.start } - { edu.end }</span>
                        <p className="small"
                           dangerouslySetInnerHTML={{__html: edu.description}}/>
                    </span>
                </span>
            </li>
        );
    },

    renderReference(ref, key) {
        return (
            <div key={key} className="vertical-timeline-block">
                <div className="vertical-timeline-icon navy-bg">
                    <i className="fa fa-user"/>
                </div>
                <div className="vertical-timeline-content">
                    <h2 className="m-b-xs">
                        {ref.name ? ref.name : ''} <br/>
                        <small>
                            {ref.title ? ref.title : ''} at &nbsp;
                            <strong>{ref.companyName ? ref.companyName : ''}</strong>
                        </small>
                    </h2>
                    <span>
                        Email: {ref.email ? ref.email : ''}
                        <br/>
                        Phone number: {ref.phone ? ref.phone : ''}
                    </span>
                </div>
            </div>
        );
    },

    renderAttachment(attachment) {
        const attachmentUrl = `https://docs.google.com/viewer?embedded=true&url=${attachment}`;

        const viewerClass = classNames(
            'attachment-viewer',
            {
                fullscreen: this.state.fullscreen
            }
        );

        let viewButtons = null;
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

        return (
            <div className="ibox hidden-print" ref="resumeAttachment">
                <div className="ibox-content">
                    <h2><i className="fa fa-fw fa-paperclip"></i> Attached CV</h2>

                    <div className="center-block text-center">

                        <span className="fa fa-file-pdf-o big-icon"></span><br />

                        <div className="text-center">
                            {viewButtons}
                            &nbsp;&nbsp;
                            <a className="btn btn-primary btn-outline m-t-sm" href={attachment} download={attachment} target="_blank">
                                <i className="fa fa-fw fa-download"></i>
                                <span> Download CV</span>
                            </a>
                        </div>

                        {this.state.isViewCV ? (
                            <div className={viewerClass}>
                                <iframe src={attachmentUrl} frameborder="0"></iframe>
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