var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

let {Row, Col} = ReactBootstrap;

JobCandidates = React.createClass({
    mixins: [ReactMeteorData, FluxMixin, StoreWatchMixin("JobDetailsStore")],

    getStateFromFlux() {
        return this.getFlux().store("JobDetailsStore").getState();
    },

    getMeteorData() {
        var self = this;
        var candidates = [];
        var isLoading = true;
        var total = 0;
        //JobDetailsSubs.subscribe('applicationCounter', self.counterName(), self.filters());
        var sub = Meteor.subscribe('getApplications', this.filter(), this.options());
        if (sub.ready()) {
            isLoading = false;
            candidates = this.fetch();
            total = Collections.Applications.find(this.filter()).count();
        }

        return {
            isLoading: isLoading,
            candidates: candidates,
            currentEntryId: Router.current().params.query.application || null,
            isLoadMore: this.state.limit < total
        }
    },

    filter: function () {
        var filter = {
            jobId: this.state.jobId,
            stage: this.state.stage.id,
            isDeleted: 0
        };
        if (this.state.search.length > 0) {
            filter.fullname = {
                $regex: this.state.search.replace(/\s+/g, '|'),
                $options: 'i'
            }
        }
        return filter;
    },

    options: function () {
        var sort = {};
        sort[this.state.sortBy] = (this.state.sortType == "asc") ? 1 : -1;
        return {
            sort: sort,
            limit: this.state.limit
        }
    },

    fetch: function () {
        var items = [];
        var applications = Collections.Applications.find(this.filter(), this.options()).fetch();
        _.each(applications, function (app) {
            var candidate = Collections.Candidates.findOne({candidateId: app.candidateId});
            if (candidate) {
                candidate.application = app;
                items.push(candidate);
            } else {
                console.log(app)
            }
        });
        return items;
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
        var loadmoreBtn = null;
        if (this.data.isLoadMore) {
            loadmoreBtn = <button className="btn btn-default btn-block btn-sm"
                                  onClick={ ()=> this.getFlux().actions.loadMoreCandidate() }>load more</button>;
        }
        console.log(loadmoreBtn);
        return (
            <div className="fh-column">
                <JobCandidatesActions disabled={ !this.state.selected.length }/>

                <div className="full-height-scroll">
                    <ul className="list-group elements-list">
                        {this.data.candidates.map(this.renderCandidate)}
                        <li className="list-group-item clear">
                            {loadmoreBtn}
                        </li>
                    </ul>
                    <Row>
                        <Col md={10} mdOffset={1} style={{height : '60px'}}>

                        </Col>
                    </Row>
                </div>
            </div>
        );
    },
    renderCandidate(candidate, key) {
        var selected = false;
        if (candidate.application.entryId == this.data.currentEntryId)
            selected = true;

        return <JobCandidate key={key} candidate={candidate} selected={selected} isSelectAll={this.state.isSelectAll}/>;
    }
})