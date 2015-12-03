const ActionMixin = {
    handle___Assign(userId, role) {
        Meteor.call('assignJobRecruiter', this.props.jobId, role, userId);
    },

    handle___Unassign(userId, role) {
        Meteor.call('unassignJobRecruiter', this.props.jobId, role, userId);
    }
};

const RendererMixin = {
    render__Content() {
        return (
            <table className="table">
                <thead>
                <tr>
                    <th colSpan="2">
                        <h2>
                            <i className="fa fa-users"/>
                            &nbsp;
                            WHO'S RESPONSIBLE FOR THIS JOB
                        </h2>
                    </th>
                </tr>
                </thead>
                <tbody>
                {this.state.jobRoles.map((role, key) => {
                    return <JobHiringTeamGroup
                        key={key}
                        jobId={this.props.jobId}
                        name={role.name}
                        role={role.alias}
                        recruiters={this.props.recruiters[role.alias]}
                        onAssign={this.handle___Assign}
                        onUnassign={this.handle___Unassign}/>
                    })}
                </tbody>
            </table>
        );
    }
};

JobHiringTeam = React.createClass({
    mixins: [ActionMixin, RendererMixin],
    propTypes: {
        jobId: React.PropTypes.number.isRequired,
        recruiters: React.PropTypes.object.isRequired
    },

    getInitialState() {
        return {
            jobRoles: [
                {name: 'Managers', alias: 'manager'},
                {name: 'Recruiters', alias: 'recruiter'}
            ]
        };
    },

    render() {
        return this.props.recruiters ? this.render__Content() : null;
    }
});

JobHiringTeamGroup = React.createClass({
    propTypes: {
        name: React.PropTypes.string.isRequired,
        role: React.PropTypes.string.isRequired,
        recruiters: React.PropTypes.array.isRequired,
        onAssign: React.PropTypes.func,
        onUnassign: React.PropTypes.func
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
                        {this.props.recruiters.map((r, key) => <JobHiringTeamGroupItem key={key} recruiter={r}
                                                                                       onUnassign={this.props.onUnassign}
                                                                                       role={this.props.role}/>)}
                        <tr>
                            <td colSpan="2">
                                <JobHiringTeamAssignForm
                                    role={this.props.role}
                                    jobId={this.props.jobId}
                                    except={_.pluck(this.props.recruiters, 'userId')}
                                    onAssign={this.props.onAssign}/>
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
    propTypes: {
        role: React.PropTypes.string.isRequired,
        recruiter: React.PropTypes.object.isRequired
    },

    handleTrashClick(e) {
        e.preventDefault();
        this.props.onUnassign && this.props.onUnassign(this.props.recruiter.userId, this.props.role);
    },

    render() {
        //console.log('this.props.recruiter', this.props.recruiter);
        return (
            <tr>
                <td width="*">
                    <span>{ this.props.recruiter.name }</span><br/>
                    <span style={{fontSize:'0.8em'}}>{this.props.recruiter.email}</span>
                </td>
                <td width="50px">
                    <button className="btn btn-link btn-sm" onClick={ this.handleTrashClick }>
                        <i className="fa fa-trash"/> remove
                    </button>
                </td>
            </tr>
        );
    }
})