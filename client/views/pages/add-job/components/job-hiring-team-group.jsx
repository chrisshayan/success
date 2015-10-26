JobHiringTeamGroup = React.createClass({
    propTypes: {
        name: React.PropTypes.string.isRequired,
        role: React.PropTypes.string.isRequired,
        users: React.PropTypes.array.isRequired
    },

    render() {
        return (
            <tr>
                <td>
                    <h3>{this.props.name}</h3>
                </td>
                <td>
                    <table className="table table-striped">
                        <tbody>
                        {this.props.users.map((user, key) => <JobHiringTeamGroupItem key={key} user={user}
                                                                                     role={this.props.role}/>)}
                        <tr>
                            <td colSpan="2">
                                <JobHiringTeamAssignForm role={this.props.role}
                                                         except={_.pluck(this.props.users, '_id')}/>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        );
    }
});

JobHiringTeamGroupItem = React.createClass({
    contextTypes: {
        actions: React.PropTypes.object
    },

    propTypes: {
        user: React.PropTypes.object.isRequired
    },


    name() {
        if (!this.props.user) return '';
        var profile = this.props.user.profile;
        var displayname = [profile.firstname, profile.lastname].join(' ').trim();

        return (displayname.length) ? displayname : this.props.user.emails[0].address;
    },

    handleTrashClick(user) {
        this.context.actions.unassign(user._id, this.props.role);
    },
    render() {
        return (
            <tr>
                <td width="*">{this.name()}</td>
                <td width="50px">
                    <button className="btn btn-link btn-sm" onClick={ () => this.handleTrashClick(this.props.user) }><i
                        className="fa fa-trash"></i> remove
                    </button>
                </td>
            </tr>
        );
    }
})