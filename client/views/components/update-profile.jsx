UpdateProfileForm = React.createClass({
    mixins: [ReactMeteorData],

    getInitialState() {
        return {

        };
    },

    getMeteorData() {
        var user = Meteor.user();
        return {
            userId: user && user._id,
            user: user,
            profile: user && user.profile
        };
    },

    componentDidMount() {
        if (this.state.isEditing) {

        }
    },

    componentWillUpdate(nextProps, nextState) {
        if (nextState.isEditing) {

        } else {

        }
    },

    handleToggleClick(e) {
        this.setState({
            isEditing: !this.state.isEditing
        });
        e.preventDefault();
    },

    handleSaveClick(e) {
        e.preventDefault();
        var newVal = $(this.editor).code();
        this.setState({
            isEditing: false
        });
    },

    handleSubmit(e) {
        e.preventDefault();
    },

    render() {
        let styles = {
            container: {
                minHeight: '300px'
            },
            editor: {
                minHeight: '300px'
            },
            button: {
                margin: '0 3px'
            }
        };

        let buttons = [];

        if (this.state.isEditing) {
            buttons.push(<button style={styles.button} className="btn btn-white" onClick={this.handleToggleClick}>
                Discard</button>);
            buttons.push(<button style={styles.button} className="btn btn-white" onClick={this.handleSaveClick}>
                Save</button>);
        } else {
            buttons.push(<button style={styles.button} className="btn btn-white" onClick={this.handleToggleClick}>
                Edit</button>);
        }
        return (
            <div style={styles.container}>
                <form onSubmit={this.handleSubmit}>

                </form>
                <div>
                    {buttons}
                </div>
            </div>
        );
    }
});