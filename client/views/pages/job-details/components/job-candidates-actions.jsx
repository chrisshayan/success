let { Input, Label, Button, ButtonGroup, DropdownButton, MenuItem, Modal } = ReactBootstrap;

JobCandidatesActions = React.createClass({
    contextTypes: {
        actions: React.PropTypes.object
    },

    getInitialState() {
        return {
            showSearchBox: false,
            showSortBox: false
        }
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

                    <ActionSelectAll onToggleSelectAll={this.context.actions.toggleSelectAll}/>

                    <button
                        onClick={ this.toggleSearchBox }
                        className="btn btn-link btn-md"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="" data-original-title="Search candidate">
                        <i className="fa fa-search"></i>
                    </button>

                    <button
                        className="btn btn-link btn-md"
                        data-toggle="tooltip"
                        data-placement="top"
                        title=""
                        data-original-title="Sort" onClick={ this.toggleSortBox }>
                        <i className="fa fa-sort-amount-asc"></i>
                    </button>

                    <BulkActions disabled={ this.props.disabled }/>
                </div>

                {this.state.showSearchBox ? (<ActionSearch onSearch={this.context.actions.search} />) : null}
                {this.state.showSortBox ? (<ActionSort onSortCandidate={this.context.actions.sort} />) : null}

            </div>
        );
    }
});


var ActionSelectAll = React.createClass({
    componentDidMount() {
        var self = this;
        var selectEl = React.findDOMNode(this.refs.checkbox);
        $(selectEl).iCheck({
            checkboxClass: 'icheckbox_square-green'
        });

        $(selectEl).on('ifChanged', function (event) {
            self.props.onToggleSelectAll();
        });
    },

    render() {
        return (
            <div
                style={styles.jobCandidates.checkallAction}
                data-toggle="tooltip"
                data-placement="top"
                title="Select all"
                data-original-title="Select all">

                <input type="checkbox" ref="checkbox" className="action-select-all"/>

            </div>
        );
    }
});

var ActionSearch = React.createClass({
    getInitialState() {
        return {};
    },

    onSearch: function (e) {
        this.props.onSearch(e.target.value);
    },

    componentDidMount(){
        React.findDOMNode(this.refs.searchInput).focus();
    },

    render() {
        return (
            <div>
                <input
                    ref="searchInput"
                    type="text"
                    className="form-control"
                    placeholder="Search candidates"
                    onKeyUp={this.onSearch}/>
            </div>
        );
    }
});

var ActionSort = React.createClass({
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
        if (sort) {
            this.setState({
                currentSort: sort
            });
            this.props.onSortCandidate(field, type);
        }
    },

    render() {
        return (
            <div>
                <div className="btn-group" style={{width: "100%"}}>
                    <button type="button" style={{width: "100%"}} className="btn btn-white btn-sm dropdown-toggle"
                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
        return (<li key={key}><a href="#" onClick={this.onSort} data-sort-field={data.field}
                                 data-sort-type={data.type}>{ data.label }</a></li>);
    }
});

const BulkActions = React.createClass({
    contextTypes: {
        state: React.PropTypes.object,
        actions: React.PropTypes.object,
        helpers: React.PropTypes.object
    },
    getInitialState() {
        return {
            isSendMassEmail: false
        }
    },

    onSendMassEmail(e) {
        e.preventDefault();
        var emails = this.context.helpers.getEmailsSelected();

        if (emails.length > 0)
            this.setState({isSendMassEmail: true});
        else
            swal({
                type: "warning",
                title: "There is no email"
            })
    },

    onHideSendMassModal () {
        this.setState({isSendMassEmail: false});
        this.context.actions.deselectAll();
    },

    massDisqualify() {
        var self = this;
        var selectedItems = this.context.state.selectedItems;

        swal({
            title: "Are you sure?",
            text: "They don't qualify for this job?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            closeOnConfirm: false,
            html: false
        }, function () {
            Meteor.call('disqualifyApplications', selectedItems);
            swal("Disqualifed!", "", "success");
            self.context.actions.deselectAll();
        });
    },

    render() {
        return (
            <DropdownButton disabled={this.props.disabled} title='bulk actions' bsStyle="link" className="pull-right">
                <MenuItem eventKey='1' onClick={this.onSendMassEmail}><i className="fa fa-envelope-o"></i>&nbsp;Send
                    mass emails</MenuItem>
                <MenuItem onClick={this.massDisqualify} eventKey='2'><i className="fa fa-thumbs-o-down"></i>&nbsp;
                    Disqualify candidates</MenuItem>

                <div>{this.state.isSendMassEmail ?
                    <MailComposerModal show={true} onHide={this.onHideSendMassModal}/> : null}</div>
            </DropdownButton>
        );
    }
});

MailComposerModal = React.createClass({
    contextTypes: {
        state: React.PropTypes.object
    },
    getInitialState() {
        return {
            to: []
        };
    },
    componentWillMount() {
        var mailTo = {
            appIds: [],
            emails: []
        };
        _.each(this.context.state.selectedItems, function(id) {
            var app = Meteor.applications.findOne({_id: id});
            if(app && app.candidateInfo && app.candidateInfo.emails.length > 0) {
                mailTo.appIds.push(id);
                mailTo.emails.push(app.candidateInfo.emails[0]);
            }
        });
        this.setState({to: mailTo});
    },
    render() {
        return (
            <Modal {...this.props}
                className="mass-email-modal"
                bsSize='large' show={this.props.show}
                onHide={this.props.onHide}>
                <MailComposer onDiscard={this.props.onHide} to={this.state.to}/>
            </Modal>
        );
    }
});