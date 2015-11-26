const RendererMixin = {};

JobCandidateResume = React.createClass({
    mixins: [RendererMixin],
    propTypes: {
        application: React.PropTypes.object.isRequired,
        resume: React.PropTypes.object
    },

    getInitialState() {
        return {

        };
    },


    render() {
        if(_.isEmpty(this.props.resume)) return null;
        return <JobCandidateResumeOnline resume={this.props.resume} application={this.props.application} />
    }
});

JobCandidateResumeOffline = React.createClass({
    propTypes: {
        application: React.PropTypes.object.isRequired,
        candidate: React.PropTypes.object.isRequired,
    },

    getInitialState() {
        return {
            isViewingCV: false
        }
    },

    componentDidUpdate(prevProps, prevState) {
        if(prevState.isViewingCV != this.state.isViewingCV) {
            if(this.state.isViewingCV) {
                let container = this.refs.viewerContainer.getDOMNode();
                let scrollTo = $(container).offset().top - 140;
                $('body').animate({
                    scrollTop: scrollTo
                }, 'slow');
            }
        }
    },

    handleToggleViewCV(e) {
        e.preventDefault();
        this.setState({
            isViewingCV: !this.state.isViewingCV
        });
    },

    render() {
        cvLink = "https://docs.google.com/viewer?embedded=true&url=" + this.props.application.resumeFileUrl();
        return (
            <div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="ibox">
                            <div className="">
                                <h2><i className="fa fa-fw fa-quote-left hidden-print"></i> Cover Letter</h2>

                                <blockquote>
                                    {/*<p className="small"
                                     dangerouslySetInnerHTML={{__html: this.props.application.coverLetter()}}/>*/}
                                </blockquote>
                            </div>
                        </div>
                    </div>
                </div>

                <hr/>

                <div className="ibox hidden-print">
                    <div className="ibox-content">
                        <h2><i className="fa fa-fw fa-paperclip"></i> Attached CV</h2>
                        <div className="center-block text-center">

                            <span className="fa fa-file-pdf-o big-icon"></span><br />
                            <div className="text-center">
                                <button type="button" className="btn btn-primary btn-outline m-t-sm" onClick={this.handleToggleViewCV}>
                                    <i className="fa fa-fw fa-eye"></i> Preview by Google Viewer
                                </button>
                                &nbsp;&nbsp;
                                <a className="btn btn-primary btn-outline m-t-sm" href={this.props.application.resumeFileUrl()} target="_blank">
                                    <i className="fa fa-fw fa-download" ></i>
                                    <span> Download CV</span>
                                </a>
                            </div>

                        </div>
                    </div>
                </div>

                {!this.state.isViewingCV ? null : (
                <div className="cv-viewer" ref={"viewerContainer"}>
                    <div className="row">
                        <div className="col-md-12">
                            <iframe src={cvLink} style={{border: '1px solid #ddd', width: '100%', height: '1024px', marginTop: '15px'}}></iframe>
                        </div>
                    </div>
                </div> )}

            </div>
        );
    }
});


JobCandidateResumeOnline = React.createClass({
    propTypes: {
        application: React.PropTypes.object.isRequired,
        resume: React.PropTypes.object
    },

    componentDidMount() {

    },

    render() {
        const resume = this.props.resume;
        console.log(resume)
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

                {resume && resume['attachments'] ? (
                <div className="ibox hidden-print">
                    <div className="ibox-content">
                        <h2><i className="fa fa-fw fa-paperclip"></i> Attached CV</h2>
                        <div className="center-block text-center">

                            <span className="fa fa-file-pdf-o big-icon"></span><br />
                            <div className="text-center">
                                <button type="button" className="btn btn-primary btn-outline m-t-sm">
                                    <i className="fa fa-fw fa-eye"></i> Preview by Google Viewer
                                </button>
                                &nbsp;&nbsp;
                                <a className="btn btn-primary btn-outline m-t-sm" href="#" target="_blank">
                                    <i className="fa fa-fw fa-download" ></i>
                                    <span> Download CV</span>
                                </a>
                            </div>

                        </div>
                    </div>
                </div>
                    ) : null}
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
    }
});