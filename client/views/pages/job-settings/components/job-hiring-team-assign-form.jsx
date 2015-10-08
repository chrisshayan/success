JobHiringTeamAssignForm = React.createClass({
    propTypes: {
        role: React.PropTypes.string.isRequired
    },

    contextTypes: {
        actions: React.PropTypes.object
    },

    getInitialState() {
        return {
            text: ''
        };
    },



    handleClick(e) {
        e.preventDefault();
        if(this.state.text.length > 0) {
            this.context.actions.assign(this.state.text, this.props.role);
            this.setState({text: ''});
        }
    },

    handleSelect(u) {
        this.context.actions.assign(u._id, this.props.role);
    },

    render () {
        return (
            <div>
                <RecruiterSearch onSelect={this.handleSelect} except={this.props.except} />
            </div>
        );
    }
})