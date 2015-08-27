JobCandidatesContainer = React.createClass({
    getInitialState() {
        return {
            flux: null
        };
    },
    componentWillMount() {
        var stores = {
            JobDetailsStore:  new AppStores.JobDetails()
        };
        window.stores = stores;
        flux = new Fluxxor.Flux(stores, AppActions.JobDetails);
        this.setState({flux: flux});
    },
    render() {
        if(this.state.flux)
            return <JobCandidates flux={this.state.flux} />;
        return null;
    }
});