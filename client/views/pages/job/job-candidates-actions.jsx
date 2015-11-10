let {
    DropdownButton,
    MenuItem
} = ReactBootstrap;

JobCandidateListActions = React.createClass({
    getInitialState() {
        return {
            sortOptions: [
                {
                    label: 'Applied date',
                    icon: 'fa fa-sort-desc pull-right',
                    field: 'createdAt',
                    type: -1
                },
                {
                    label: 'Applied date',
                    icon: 'fa fa-sort-asc pull-right',
                    field: 'createdAt',
                    type: 1
                },
                {
                    label: 'Matching score',
                    icon: 'fa fa-sort-desc pull-right',
                    field: 'matchingScore',
                    type: -1
                },
                {
                    label: 'Matching score',
                    icon: 'fa fa-sort-asc pull-right',
                    field: 'matchingScore',
                    type: 1
                }
            ],
            sortKey: 0
        };
    },

    handleSearch(e) {
        e.preventDefault();
        let q = e.target.value.trim();
        this.props.onSearch(q);
    },

    handleSwitchSort(key, sort) {
        this.setState({
            sortKey: key
        });
        this.props.onSort(sort.field, sort.type);
    },

    handleDisqualify() {
        this.props.onBulkDisqualify && this.props.onBulkDisqualify();
    },

    handleRevertQualify() {
        this.props.onBulkRevertQualify && this.props.onBulkRevertQualify();
    },

    handleSendMessage() {
        this.props.onBulkSendMessage && this.props.onBulkSendMessage();
    },

    render() {
        let styles = {
            container: {},

            checkbox: {
                width: '10%',
                minWidth: '30px',
                textAlign: 'center',
                paddingTop: '5px'
            },

            content: {
                width: '100%',
                padding: '0'
            },

            checkallContainer: {
                float: 'left',
                width: '32px',
                padding: '5px 0 8px 5px',
                borderRight: '1px solid #ddd'
            },

            searchBox: {
                background: 'url(/search.png) no-repeat 98% center',
                border: 'none'
            }
        };
        return (
            <div>
                <div className="clearfix border-bottom" style={styles.container}>
                    <div style={styles.content} className="pull-left border-left">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by name or tags"
                            style={styles.searchBox}
                            onKeyUp={this.handleSearch}/>
                    </div>
                </div>
                <div className="clearfix border-bottom" style={{background:'#f9f9f9'}}>
                    <div style={styles.checkallContainer}>
                        <JobCandidateCheckBox
                            onCheck={this.props.onSelectAll}
                            onUncheck={this.props.onDeselectAll}/>
                    </div>
                    <DropdownButton bsStyle={'link'} title='Sort by' id={"menu-" + Date.now()} className="pull-left"
                                    pullRight={true}>
                        {this.state.sortOptions.map((s, key) => {
                            return (
                            <MenuItem key={key} eventKey={key} onSelect={() => this.handleSwitchSort(key, s)}>
                                {this.state.sortKey === key ? <i className="fa fa-check dropdown-check"/> : null}
                                {s.label}
                                <i className={s.icon}/>
                            </MenuItem>
                                );
                            })}
                    </DropdownButton>
                    <DropdownButton bsStyle={'link'} title='Actions' id={"menu-" + Date.now()} className="pull-right">
                        {!this.props.disqualified
                            ? <MenuItem key={0} eventKey={0} onSelect={this.handleDisqualify}>Disqualify</MenuItem>
                            : <MenuItem key={0} eventKey={0} onSelect={this.handleRevertQualify}>Revert qualify</MenuItem>}

                        <MenuItem key={1} eventKey={1}  onSelect={this.handleSendMessage}>Send message</MenuItem>
                    </DropdownButton>
                </div>
            </div>
        );
    }
});