let {Row, Col} = ReactBootstrap;

JobCandidates = React.createClass({
    contextTypes: {
        state: React.PropTypes.object,
        data: React.PropTypes.object,
        actions: React.PropTypes.object
    },

    getInitialState() {
        return {};
    },

    componentDidMount() {
        // Set the height of the wrapper
        $('#page-wrapper').css("min-height", $(window).height() + "px");

        // Add slimScroll to element
        $('.full-height-scroll').slimscroll({
            height: '100%'
        });

        // Add slimScroll to left navigation
        $('.sidebar-collapse').slimScroll({
            height: '100%',
            railOpacity: 0.9
        });

    },

    render() {
        var loading = null;
        var loadmoreBtn = null;
        if(this.context.state.isLoading) {
            loading = (
                <div style={{marginBottom: "10px", textAlign: "center"}}>
                    <img src="/ring.svg" />
                </div>
            );
        }
        if (this.context.state.hasMore) {
            loadmoreBtn = <button className="btn btn-default btn-block btn-sm"
                                  onClick={ ()=> this.context.actions.loadMore() }>load more</button>;
        }

        return (
            <div className="fh-column">
                <JobCandidatesActions disabled={!this.context.state.selectedItems.length} />
                <div className="full-height-scroll">
                    <ul className="list-group elements-list">
                        {this.context.data.applications.map(this.renderCandidate)}
                        <li className="clear">
                            <div style={{height: "120px", padding: "10px 20px 20px 20px"}}>
                                {loading}
                                {loadmoreBtn}
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        );
    },
    renderCandidate(app, key) {
        var checked = false;
        var selected = false;
        if(this.context.state.selectedItems.indexOf(app._id) >= 0) {
            checked = true;
        }
        if(this.context.state.currentApplication == app._id) {
            selected = true;
        }
        return <JobCandidate key={key} application={app} selected={selected} checked={checked}/>;
    }
})