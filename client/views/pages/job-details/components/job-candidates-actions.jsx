let { Input, Label, Button, ButtonGroup, DropdownButton, MenuItem, Modal } = ReactBootstrap;
var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

JobCandidatesActions = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin("JobDetailsStore")],

    getInitialState() {
        return {
            showSearchBox: false,
            showSortBox: false
        }
    },

    getStateFromFlux: function() {
        return this.getFlux().store("JobDetailsStore").getCandidateActionsState();
    },

    toggleSearchBox() {
        this.setState({showSearchBox: !this.state.showSearchBox});
    },
    toggleSortBox() {
        this.setState({showSortBox: !this.state.showSortBox});
    },
    render() {
        return (
            <div style={ {boxShadow: "0px 5px 11px -8px #666"} }>
                <div className="job-candidate-actions" style={styles.jobCandidates.actions}>
                    <ActionSelectAll onClick={this.props.onSelectAll}/>

                    <button onClick={ this.toggleSearchBox } className="btn btn-link btn-md" data-toggle="tooltip"
                            data-placement="top" title="" data-original-title="Search candidate"><i
                        className="fa fa-search"></i></button>

                    <button className="btn btn-link btn-md" data-toggle="tooltip" data-placement="top" title=""
                            data-original-title="Sort" onClick={ this.toggleSortBox }><i className="fa fa-sort-amount-asc"></i></button>

                    <BulkActions disabled={ !this.state.selectedItems.length } />
                </div>

                {this.state.showSearchBox ? (<ActionSearch />) : null}
                {this.state.showSortBox ? (<ActionSort />) : null}

            </div>
        );
    }
});


var ActionSelectAll = React.createClass({
    mixins: [FluxMixin],
    componentDidMount() {
        var self = this;
        var selectEl = React.findDOMNode(this.refs.checkbox);
        $(selectEl).iCheck({
            checkboxClass: 'icheckbox_square-green'
        });

        $(selectEl).on('ifChanged', function (event) {
            self.getFlux().actions.toggleSelectAllCandidate();
        });
    },

    render() {
        return (
            <div style={styles.jobCandidates.checkallAction} data-toggle="tooltip" data-placement="top"
                 title="Select all" data-original-title="Select all">
                <input type="checkbox" ref="checkbox" className="action-select-all"/>
            </div>
        );
    }
});

var ActionSearch = React.createClass({
    mixins: [FluxMixin],
    getInitialState() {
        return {

        };
    },

    onSearch: function(e) {
        this.getFlux().actions.searchCandidate(e.target.value);
    },

    render() {
        return (
            <div>
                <input ref="searchInput" type="text" className="form-control" placeholder="Search candidates" onKeyUp={this.onSearch} />
            </div>
        );
    }
});

var ActionSort = React.createClass({
    mixins: [FluxMixin],
    getInitialState() {

        var items = [
            {label: "Applied date ascending", field: "createdAt", type: "asc"},
            {label: "Applied date descending", field: "createdAt", type: "desc"},
            {label: "Matching score ascending", field: "matchingScore", type: "asc"},
            {label: "Matching score descending", field: "matchingScore", type: "desc"},
        ];
        return {
            items: items,
            currentSort: items[0]
        };
    },

    onSort(e) {
        var target = $(e.target);
        var field = target.data("sort-field");
        var type = target.data("sort-type");
        var sort = _.findWhere(this.state.items, {field: field, type: type});
        if(sort) {
            this.setState({
                currentSort: sort
            });
            this.getFlux().actions.sortCandidate({field: field, type: type});
        }
    },

    render() {
        return (
            <div>
                <div className="btn-group" style={{width: "100%"}} >
                    <button type="button" style={{width: "100%"}} className="btn btn-white btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {this.state.currentSort.label} {" "}<span className="caret"></span>

                    </button>
                    <ul className="dropdown-menu">
                        {this.state.items.map(this.renderSort)}
                    </ul>
                </div>
            </div>
        );
    },

    renderSort(data, key) {
        return (<li key={key}><a href="#" onClick={this.onSort} data-sort-field={data.field} data-sort-type={data.type}>{ data.label }</a></li>);
    }
});

const BulkActions = React.createClass({
    mixins: [FluxMixin],
    getInitialState() {
        return {
            isSendMassEmail: false
        }
    },
    componentWillMount() {
        var selectState = this.getFlux().store("JobDetailsStore").getSelectedState();
        this.setState({
            isSelectAll: selectState.isSelectAll || false
        });
    },
    onSendMassEmail(e) {
        e.preventDefault();
        var mailTo = this.getFlux().store("JobDetailsStore").getSelectedEmails();
        if(mailTo.emails.length > 0)
            this.setState({isSendMassEmail: true});
        else
            swal({
                type: "warning",
                title: "There is no email"
            })
    },

    onHideSendMassModal () {
        this.setState({isSendMassEmail: false});
        this.getFlux().store("JobDetailsStore").deselectAllCandidates();
    },

    massDisqualify() {
        var self = this;
        var appState = this.getFlux().store("JobDetailsStore").getCandidatesState();
        swal({
            title: "Are you sure?",
            text: "They don't qualify for this job?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            closeOnConfirm: false,
            html: false
        }, function(){
            Meteor.call('disqualifyApplications', appState.selected);
            swal("Disqualifed!", "", "success");
            self.getFlux().store("JobDetailsStore").deselectAllCandidates();
        });
    },

    render() {
        return (
            <DropdownButton disabled={this.props.disabled} title='bulk actions' bsStyle="link" className="pull-right">
                <MenuItem eventKey='1' onClick={this.onSendMassEmail}><i className="fa fa-envelope-o"></i>&nbsp;Send mass emails</MenuItem>
                <MenuItem onClick={this.massDisqualify} eventKey='2'><i className="fa fa-thumbs-o-down"></i>&nbsp;Disqualify candidates</MenuItem>
                <div>{this.state.isSendMassEmail ? <MailComposerModal show={true} onHide={this.onHideSendMassModal} /> : null}</div>
            </DropdownButton>
        );
    }
});

MailComposerModal = React.createClass({
    mixins: [FluxMixin],
    getInitialState() {
        return {
            to: []
        };
    },
    componentWillMount() {
        var mailTo = this.getFlux().store("JobDetailsStore").getSelectedEmails();
        this.setState({to: mailTo});
    },
    render() {
        return (
            <Modal {...this.props} className="mass-email-modal" bsSize='large' show={this.props.show} onHide={this.props.onHide}>
                <MailComposer onDiscard={this.props.onHide} to={this.state.to} />
            </Modal>
        );
    }
});