MyAccountContainer = React.createClass({
    render() {
        return (
            <div>
                <PageHeading title="My Account" />
                <div className="wrapper wrapper-content">
                    <div className="row">
                        <UpdateProfileForm />
                        <CompanyInfo />
                    </div>
                </div>
            </div>
        );
    }
});

CompanyInfo = React.createClass({
    getInitialState() {
        return {
            isLoading: false,
            data: {}
        }
    },

    componentWillMount() {
        this.setState({
            isLoading: true
        });
        Meteor.call('getCompany', 751, (err, data)=> {
            const state = {
                isLoading: false
            };
            if (!err) {
                state['data'] = data;
            }
            this.setState(state);
        })
    },

    render() {
        if (this.state.isLoading) return <WaveLoading />;
        return this.renderContent();
    },

    renderContent() {
        return (
            <div className="ibox-content">
                <div className="panel-body row">
                    <div className="col-sm-10">
                        <div className="float-e-margins animated fadeInRight">
                            <div className="content">
                                <h2>
                                    <span className="circle-wrapper">
                                        <i className="fa fa-building-o"></i> &nbsp;
                                    </span>
                                    My Company Profile
                                </h2>
                                <div className="form-horizontal">
                                    <fieldset className="m-t-lg" aria-hidden="false">
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">
                                                Company Logo
                                            </label>

                                            <div className="col-sm-9">
                                                <p className="form-control-static">
                                                    <img src={this.state.data.companyLogoURL}
                                                         alt={this.state.data.companyName}
                                                         style={{maxHeight: '200px'}}/>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">
                                                Company Name
                                            </label>

                                            <div className="col-sm-9">
                                                <p className="form-control-static">
                                                    {this.state.data.companyName}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">
                                                Company Address
                                            </label>

                                            <div className="col-sm-9">
                                                <p className="form-control-static">
                                                    {this.state.data.address}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">
                                                Contact Name
                                            </label>

                                            <div className="col-sm-9">
                                                <p className="form-control-static">
                                                    {this.state.data.contactName}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">
                                                Contact Email
                                            </label>

                                            <div className="col-sm-9">
                                                <p className="form-control-static">
                                                    {this.state.data.contactEmail}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">
                                                Company Profile
                                            </label>

                                            <div className="col-sm-9">
                                                <p className="form-control-static">
                                                    {this.state.data.companyProfile}
                                                </p>
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});