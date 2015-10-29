var AppState = function () {
    var params = Router.current().params;
    var stage = _.findWhere(Success.APPLICATION_STAGES, {alias: params.stage});
    if (!stage)
        stage = Success.APPLICATION_STAGES[1];

    return {
        jobId: params._id,
        stage: stage,
        currentApplication: params.query.application || null,
        inc: 10,
        limit: 10,
        search: "",
        sortBy: "createdAt",
        sortType: "desc",
        selectedItems: [],
        isSelectAll: false,
        isSendMassEmail: false,
        isMassDisqualify: false
    };
};
var AppActions = {

    loadMore() {
        this.setState({limit: this.state.limit + this.state.inc});
    },

    toggleSelectAll() {
        if (!this.state.isSelectAll) {
            var ids = _.pluck(this.data.applications, '_id');
            this.setState({selectedItems: ids});
        } else {
            this.setState({selectedItems: []});
        }
        this.setState({
            isSelectAll: !this.state.isSelectAll
        });
    },

    deselectAll() {
        this.setState({selectedItems: []});
    },

    toggleSelectApplication(id) {
        var _current = this.state.selectedItems;
        if (_current.indexOf(id) >= 0) {
            this.setState({
                selectedItems: _.without(_current, id)
            });
        } else {
            _current.push(id);
            this.setState({
                selectedItems: _current
            });
        }
    },

    search(text) {
        var self = this;
        this._tmp_search_id && Meteor.clearTimeout(this._tmp_search_id);
        this._tmp_search_id = Meteor.setTimeout(function () {
            self.setState({
                search: text
            });
        }, 300);
    },

    sort(field, type) {
        this.setState({
            sortBy: field,
            sortType: type
        });
    }
};

var AppHelpers = {
    getEmailsSelected() {
        var emails = [];
        _.each(this.state.selectedItems, function (appId) {
            var app = Collections.Applications.findOne({_id: appId});
            if (app) {
                emails.push(app.candidateInfo.emails[0]);
            }
        });
        return emails;
    }
};

JobCandidatesContainer = React.createClass({
    mixins: [ReactMeteorData, AppActions, AppHelpers],

    getInitialState() {
        return AppState();
    },

    getMeteorData() {
        var self = this;
        var params = Router.current().params;
        var stage = _.findWhere(Success.APPLICATION_STAGES, {alias: params.stage});
        if (!stage)
            stage = Success.APPLICATION_STAGES[1];

        var isLoading = true;
        var total = 0;
        var sub = Meteor.subscribe('getApplications', this.filter(), this.options());

        if (sub.ready()) {
            isLoading = false;
            total = Collections.Applications.find(this.filter()).count();
        }

        return {
            isLoading: isLoading,
            currentApplication: params.query.application,
            applications: this.fetch(),
            hasMore: this.state.limit < total
        }
    },

    filter: function () {
        //var job = Collections.Jobs.findOne({_id: this.state.jobId});
        var job = Meteor['jobs'].findOne({_id: this.state.jobId});
        var filter = {
            jobId: job.jobId,
            stage: this.state.stage.id,
            isDeleted: 0
        };
        if (this.state.search.length > 0) {
            filter['$or'] = [
                {
                    "candidateInfo.fullname": {
                        $regex: this.state.search.replace(/\s+/g, '|'),
                        $options: 'i'
                    }
                },
                {
                    "candidateInfo.emails": {
                        $regex: this.state.search,
                        $options: 'i'
                    }
                }
            ];
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
        return Collections.Applications.find(this.filter(), this.options()).fetch();
    },

    childContextTypes: {
        state: React.PropTypes.object,
        data: React.PropTypes.object,
        actions: React.PropTypes.object,
        helpers: React.PropTypes.object
    },

    getChildContext() {

        return {
            state: {
                jobId: this.state.jobId,
                stage: this.state.stage,
                currentApplication: this.data.currentApplication,
                inc: this.state.inc,
                limit: this.state.limit,
                search: this.state.search,
                sortBy: this.state.sortBy,
                sortType: this.state.type,
                selectedItems: this.state.selectedItems,
                isSelectAll: this.state.isSelectAll,
                isSendMassEmail: this.state.isSendMassEmail,
                isMassDisqualify: this.state.isMassDisqualify,
                isLoading: this.data.isLoading,
                hasMore: this.data.hasMore,

            },
            actions: {
                loadMore: this.loadMore,
                toggleSelectAll: this.toggleSelectAll,
                deselectAll: this.deselectAll,
                toggleSelectApplication: this.toggleSelectApplication,
                search: this.search,
                sort: this.sort
            },
            data: {
                applications: this.data.applications
            },
            helpers: {
                getEmailsSelected: this.getEmailsSelected
            }
        };
    },

    componentDidMount() {
        Event.on('movedApplication', this.onMovedApplication);
    },

    componentWillUnmount() {
        Event.removeListener('movedApplication', this.onMovedApplication);
    },

    onMovedApplication() {
        var rest = _.without(this.data.applications, this.data.currentApplication);
        if (rest.length <= 0) {
            Router.go('Job', {
                _id: this.state.jobId,
                stage: this.state.stage.alias
            });
        }
        var nextApp = rest[0];
        if(nextApp) {
            Router.go('Job', {
                _id: this.state.jobId,
                stage: this.state.stage.alias
            }, {
                application: nextApp._id
            })
        } else {
            Router.go('Job', {
                _id: this.state.jobId,
                stage: this.state.stage.alias
            });
        }
    },

    render() {
        return <JobCandidates />;

    }
});