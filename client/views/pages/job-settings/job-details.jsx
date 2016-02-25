const HelperMixin = {
    description() {
        const desc = this.state.data.jobDescription;
        return desc.replace(/[\r\n|\n]/g, '<br/>');
    },

    requirements() {
        const desc = this.state.data.skillExperience;
        return desc.replace(/[\r\n|\n]/g, '<br/>');
    },

    salaryRange() {
        const job = this.state.data;
        return `${job.salaryMin} - ${job.salaryMax}`;
    },

    reportTo() {
        const job = this.state.data;
        return job['emailAddress'] || '';
    },

    cities() {
        const job = this.state.data;
        return _.pluck(job.cities, 'name');
    }
};


const RendererMixin = {
    render__Content() {
        return (
            <div className="form-horizontal">
                <fieldset aria-hidden={false}>
                    <div className="form-group">
                        <label className="col-sm-3 control-label">
                            Job title
                        </label>
                        <div className="col-sm-9">
                            <p className="form-control-static">
                                { this.state.data.jobTitle }
                            </p>
                        </div>
                    </div>
                    <div className="hr-line-dashed"/>
                    <div className="form-group">
                        <label className="col-sm-3 control-label">
                            Job Level
                        </label>
                        <div className="col-sm-9">
                            <p className="form-control-static">
                                {this.state.data.jobLevel}
                            </p>
                        </div>
                    </div>
                    <div className="hr-line-dashed"/>
                    <div className="form-group">
                        <label className="col-sm-3 control-label">
                            Job Category
                        </label>
                        <div className="col-sm-9">
                            <p className="form-control-static">
                                {this.state.data.industries.map(this.render__City)}
                            </p>
                        </div>
                    </div>
                    <div className="hr-line-dashed"/>
                    <div className="form-group">
                        <label className="col-sm-3 control-label">
                            Job Location
                        </label>
                        <div className="col-sm-9">
                            <p className="form-control-static">
                                {this.state.data.cities.map(this.render__City)}
                            </p>
                        </div>
                    </div>
                    <div className="hr-line-dashed"/>
                    <div className="form-group">
                        <label className="col-sm-3 control-label">
                            This Position Will Report to
                        </label>
                        <div className="col-sm-9">
                            <p className="form-control-static">
                                { this.reportTo() }
                            </p>
                        </div>
                    </div>
                    <div className="hr-line-dashed"/>
                    <div className="form-group">
                        <label className="col-sm-3 control-label">
                            Salary Range
                        </label>
                        <div className="col-sm-9">
                            <p className="form-control-static">
                                { this.salaryRange() }
                            </p>
                        </div>
                    </div>
                    <div className="hr-line-dashed"/>
                    <div className="form-group">
                        <label className="col-sm-3 control-label">
                            Description
                        </label>
                        <div className="col-sm-9" dangerouslySetInnerHTML={{__html: this.description()}}>
                        </div>
                    </div>
                    <div className="hr-line-dashed"/>
                    <div className="form-group">
                        <label className="col-sm-3 control-label">
                            Requirements
                        </label>
                        <div className="col-sm-9">
                            <p className="col-sm-9 form-control-static" dangerouslySetInnerHTML={{__html: this.requirements()}} />
                        </div>
                    </div>
                    <div className="hr-line-dashed"/>
                    <div className="form-group">
                        <label className="col-sm-3 control-label">
                            Job Tags
                        </label>
                        <div className="col-sm-9">
                            <p className="form-control-static">
                                {this.state.data.skills.map(this.render__Tag)}
                            </p>
                        </div>
                    </div>
                </fieldset>
            </div>
        );
    },

    render__Tag(skill, key) {
        return <span className="tag-item" key={key}>{ skill.skillName }</span>;
    },

    render__City(city, key) {
        return <span className="tag-item" key={key}>{ city.name }</span>;
    }
};

JobDetails = React.createClass({
    mixins: [RendererMixin, HelperMixin],
    propTypes: {
        jobId: React.PropTypes.number.isRequired
    },

    getInitialState() {
        return {
            isLoading: false,
            data: {}
        };
    },

    componentWillMount() {
        this.setState({isLoading: true});
        Meteor.call('getJobInfo', this.props.jobId, (err, data) => {
            let state = {
                isLoading: false
            };

            if (!err) {
                state['data'] = data;
                // call callback on job loaded
                this.props.onJobLoaded && this.props.onJobLoaded(data);
            }

            this.setState(state);
        });
    },

    render() {
        if(this.state.isLoading) return <WaveLoading />
        return this.render__Content();
    }
})