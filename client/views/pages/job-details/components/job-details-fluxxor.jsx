AppConstants = {};
AppActions = {};
AppStores = {};

AppConstants['JobDetails'] = {
    SEARCH_CANDIDATE: "SEARCH_CANDIDATE",
    SELECT_ALL_CANDIDATE: "SELECT_ALL_CANDIDATE",
    SORT_CANDIDATE: "SORT_CANDIDATE",
    LOADMORE_CANDIDATE: "LOADMORE_CANDIDATE",
    TOGGLE_SELECT_CANDIDATE: "TOGGLE_SELECT_CANDIDATE",
    TOGGLE_SELECTALL_CANDIDATE: "TOGGLE_SELECTALL_CANDIDATE"
};


let {
    SEARCH_CANDIDATE,
    SELECT_ALL_CANDIDATE,
    SORT_CANDIDATE,
    LOADMORE_CANDIDATE,
    TOGGLE_SELECT_CANDIDATE,
    TOGGLE_SELECTALL_CANDIDATE
    } = AppConstants.JobDetails;

AppActions['JobDetails'] = {
    searchCandidate: function (keyword) {
        this.dispatch(SEARCH_CANDIDATE, keyword);
    },
    sortCandidate: function (data) {
        check(data, {
            field: String,
            type: String
        });
        this.dispatch(SORT_CANDIDATE, data);
    },
    loadMoreCandidate: function () {
        this.dispatch(LOADMORE_CANDIDATE);
    },

    toggleSelectCandidate: function (id) {
        this.dispatch(TOGGLE_SELECT_CANDIDATE, id);
    },

    toggleSelectAllCandidate: function () {
        this.dispatch(TOGGLE_SELECTALL_CANDIDATE);
    }
};


AppStores['JobDetails'] = Fluxxor.createStore({
    initialize: function () {
        var self = this;
        // Job props
        this.triggerMeteorChanged = new ReactiveVar(0);

        this.stage = {};
        this.currentJobId = null;
        this.currentJob = {};
        this.currentEntryId = null;
        this.otherJobs = [];

        // Candidates props
        this.applications = [];
        this.candidates = [];
        this.candidatesState = {
            base: 10,
            limit: 10,
            search: "",
            sortBy: "createdAt",
            sortType: "desc",
            selected: [],
            isSelectAll: false,
            isSendMassEmail: false,
            isMassDisqualify: false
        };

        // Current Candidate props
        this.currentCandidate = {};
        this.currentCandidateState = {
            showMailComposer: false,
            showCommentBox: false
        };

        // activities props
        this.activities = [];
        this.activitiesState = {
            base: 10,
            limit: 10
        };

        Tracker.autorun(function () {
            var _triggerMeteorChanged = self.triggerMeteorChanged.get();
            var params = Router.current().params;
            var stage = _.findWhere(Success.APPLICATION_STAGES, {alias: params.stage});
            self.currentJobId = Utils.transformVNWId(params.jobId);


            if (!stage)
                self.stage = Success.APPLICATION_STAGES[1];
            else
                self.stage = stage;

            self.emit("change");

            // Send subscribe request
            //Meteor.subscribe('applicationCounter', self.counterName(), self.filters());
            //var sub = Meteor.subscribe('getApplications', self.filters(), self.options());
            //
            //if (sub.ready()) {
            //    self.emit("change");
            //}

        });


        this.bindActions(
            SEARCH_CANDIDATE, this.onSearchCandidate,
            SORT_CANDIDATE, this.onSortCandidate,
            LOADMORE_CANDIDATE, this.onLoadmoreCandidate,
            TOGGLE_SELECT_CANDIDATE, this.onToggleSelectCandidate,
            TOGGLE_SELECTALL_CANDIDATE, this.onToggleSelectAllCandidate
        );
    },

    counterName: function () {
        if (this.stage && this.currentJobId)
            return "job_application_" + this.currentJobId + "_" + this.stage.id;
        return "";
    },

    filters: function () {
        return {
            jobId: this.currentJobId,
            stage: this.stage.id
        };
    },

    options: function () {
        var sort = {};
        sort[this.candidatesState.sortBy] = (this.candidatesState.sortType == "asc") ? 1 : -1;
        return {
            sort: sort,
            limit: this.candidatesState.limit
        }
    },

    fetch: function () {
        var items = [];
        var applications = [];
        applications = Collections.Applications.find(this.filters(), this.options()).fetch();
        _.each(applications, function (app) {
            var candidate = Collections.Candidates.findOne({candidateId: app.candidateId});
            if (candidate) {
                candidate.application = app;
                items.push(candidate);
            }
        });
        return items;
    },

    total: function () {
        return Collections.Applications.find(this.filters()).count();
    },

    triggerAppChanged: function () {
        this.triggerMeteorChanged.set(Date.now());
        this.emit('change');
    },

    onSearchCandidate: function (keyword) {
        check(keyword, String);
        var self = this;
        this.candidateSearchId && Meteor.clearTimeout(this.candidateSearchId);
        this.candidateSearchId = Meteor.setTimeout(function () {
            self.candidatesState.search = keyword.trim();
            self.candidatesState.limit = self.candidatesState.base;
            self.emit('change');
        }, 500);

    },

    onSortCandidate: function (data) {
        check(data, {
            field: String,
            type: String
        });
        this.candidatesState.sortBy = data.field;
        this.candidatesState.sortType = data.type;
        this.emit("change");
    },

    onLoadmoreCandidate: function () {
        this.candidatesState.limit += this.candidatesState.base;
        this.triggerMeteorChanged.set(Date.now());
        this.emit('change');
    },

    onToggleSelectCandidate: function (id) {
        var idx = this.candidatesState.selected.indexOf(id);
        if (idx < 0) {
            this.candidatesState.selected.push(id)
            this.candidatesState.selected = _.unique(this.candidatesState.selected);
        } else {
            this.candidatesState.selected.splice(idx, 1);
        }
        this.emit('change');
    },

    onToggleSelectAllCandidate: function () {
        var self = this;
        var currentStatus = this.candidatesState.isSelectAll;
        var newStatus = !this.candidatesState.isSelectAll;
        if (currentStatus === true && newStatus === false) {
            this.candidatesState.selected = [];
        } else {
            self.candidatesState.selected = [];
            _.each(this.fetch(), function (can) {
                self.candidatesState.selected.push(can.application._id);
            });
        }
        this.candidatesState.isSelectAll = newStatus;
        this.emit("change");
    },

    triggerMoveApplication: function () {
        var candidates = this.fetch();
        if (candidates.length > 0) {
            Router.go('jobDetails', {
                jobId: this.currentJobId,
                stage: this.stage.alias
            }, {
                query: {
                    application: candidates[0].application.entryId
                }
            });
        } else {
            Event.emit('emptyProfile');
            Router.go('jobDetails', {
                jobId: this.currentJobId,
                stage: this.stage.alias
            });
        }
        this.triggerAppChanged();
    },

    getState: function () {

        var candidateState = this.candidatesState;
        var appState = {
            jobId: this.currentJobId,
            stage: this.stage
        };

        return _.extend(appState, candidateState);
    },

    getCandidatesState: function () {
        var self = this;
        var candidatesState = this.candidatesState;
        var candidates = this.fetch();
        candidatesState.candidates = candidates.slice(0, candidatesState.limit);
        candidatesState.isLoadMore = candidatesState.limit < this.total();
        return candidatesState;
    },

    getSelectedState: function () {
        return {
            isSelectAll: this.candidatesState.isSelectAll
        }
    },

    getCandidateActionsState: function () {
        return {
            selectedItems: this.candidatesState.selected
        }
    },

    getCandidateState: function (candidate) {
        var app = candidate.application;
        return {
            selected: this.candidatesState.selected.indexOf(app._id) >= 0
        };
    },

    getSelectedEmails: function () {
        var appIds = [];
        var emails = [];
        _.each(this.candidatesState.selected, function (appId) {
            var app = Collections.Applications.findOne({_id: appId});
            if (app) {
                var candidate = Collections.Candidates.findOne({candidateId: app.candidateId});
                if (candidate) {
                    var email = candidate.data.username || candidate.data.email1 || candidate.data.email2 || candidate.data.email;
                    if(!email) return;
                    appIds.push(appId);
                    emails.push(email);
                }
            }
        });
        return {
            appIds: appIds,
            emails: emails
        };
    },
    deselectAllCandidates: function () {
        this.candidatesState.selected = [];
        this.emit('change');
    }
});


