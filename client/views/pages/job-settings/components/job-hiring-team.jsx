JobHiringTeam = React.createClass({
    contextTypes: {
        state: React.PropTypes.object,
        actions: React.PropTypes.object
    },

    getInitialState() {
        return {
            jobRoles: [
                {name: 'Managers', alias: 'manager'},
                {name: 'Recruiters', alias: 'recruiter'},
                {name: 'Coordinators', alias: 'coordinator'},
                {name: 'Sourcers', alias: 'sourcer'}
            ]
        };
    },

    shouldComponentUpdate(nextProps) {
        return !_.isEqual(nextProps.recruiters, this.props.recruiters);
    },

    render() {
        return (
            <table className="table">
                <thead>
                <tr>
                    <th colSpan="2">
                        <h2>
                            <i className="fa fa-users"></i>
                            &nbsp;
                            WHO'S RESPONSIBLE FOR THISJOB
                        </h2>
                    </th>
                </tr>
                </thead>
                <tbody>
                    {this.state.jobRoles.map( (role, key) => {
                        return <JobHiringTeamGroup
                                    key={key}
                                    jobId={this.props.jobId}
                                    name={role.name}
                                    role={role.alias}
                                    users={this.props.recruiters[role.alias]} />
                    })}
                </tbody>
            </table>
        );
    }
})
