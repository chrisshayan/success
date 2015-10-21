MailSignatureEditor = React.createClass({
    mixins: [ReactMeteorData],
    getInitialState() {
        return {
            isEditing: true
        };
    },
    getMeteorData() {
        return {
            userId: Meteor.userId(),
            user: Meteor.user()
        };
    },

    componentDidMount() {
        this.editor = this.refs.editor.getDOMNode();
        if (this.state.isEditing) {
            $(this.editor).summernote({focus: true});
        }
    },

    componentWillUpdate(nextProps, nextState) {
        if (nextState.isEditing) {
            $(this.editor).summernote({focus: true});
        } else {
            $(this.editor).destroy();
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
        Meteor.users.update({_id: this.data.userId}, {
            $set: {
                emailSignature: newVal
            }
        });
        this.setState({
            isEditing: false
        });
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
                <div
                    ref={'editor'}
                    style={styles.editor}
                    dangerouslySetInnerHTML={{__html: (this.data.user ? this.data.user.emailSignature : '')}}
                    />

                <div>
                    {buttons}
                </div>
            </div>
        );
    }
});