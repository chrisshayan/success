JobHiringTeamAssignForm = React.createClass({
    propTypes: {
        role: React.PropTypes.string.isRequired,
        onAssign: React.PropTypes.func.isRequired
    },


    handleSelect(u) {
        this.props.onAssign && this.props.onAssign(u._id, this.props.role);
    },

    render () {
        return (
            <div>
                <RecruiterSearch onSelect={this.handleSelect} except={this.props.except} />
            </div>
        );
    }
})