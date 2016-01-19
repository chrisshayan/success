var LinkedStateMixin = React.addons.LinkedStateMixin;

UpdateProfileForm = React.createClass({
    mixins: [ReactMeteorData, LinkedStateMixin],

    getInitialState() {
        return {
            isEditing: false,
	        showChangePassword: false,
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

    componentDidUpdate(prevProps, prevState) {
        if (this.state.isEditing != prevState.isEditing) {
            const editor = this.refs.editor.getDOMNode();
            if (this.state.isEditing) {
                $(editor).summernote();
            } else {
                $(editor).destroy();
            }
        }
    },

    email() {
        var user = this.data.user;
        return user ? user.defaultEmail() : '';
    },

    username() {
        var user = this.data.user;
        return user ? user.username : '';
    },

    firstName() {
        var user = this.data.user;
        return user && user.profile && user.profile.firstname ? user.profile.firstname : '';
    },

    lastName() {
        var user = this.data.user;
        return user && user.profile && user.profile.lastname ? user.profile.lastname : '';
    },

    mailSignature() {
        var user = this.data.user;
        return user && user.emailSignature ? user.emailSignature : '';
    },

    handleToggleClick(e) {
        // if isEdit == false : start edit page, saved the  textarea into variable originContent.
        // if isEdit == true  : finish edit page, revert the originContent into textarea.
        if (this.state.isEditing)
            $(this.refs.editor.getDOMNode()).code(this.state.originContent);
        else
            this.setState({
                originContent: $(this.refs.editor.getDOMNode()).code()
            });


        this.setState({
            isEditing: !this.state.isEditing
        });
        e.preventDefault();
    },

    handleSaveClick(e) {
        e.preventDefault();
        var firstname = this.refs.firstname.getDOMNode().value;
        var lastname = this.refs.lastname.getDOMNode().value;
        var emailSignature = $(this.refs.editor.getDOMNode()).code();
        Meteor.users.update({_id: this.data.userId}, {
            $set: {
                "emailSignature": emailSignature,
                "profile.lastname": lastname,
                "profile.firstname": firstname
            }
        });

        this.setState({
            isEditing: false
        });
        return;
    },

	handleDismissChangePassword() {
		this.setState({showChangePassword: false});
	},

	handleShowChangePassword() {
		this.setState({showChangePassword: true});
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
            buttons.push(<a key={0} style={styles.button} className="btn btn-default btn-outline"
                            onClick={this.handleToggleClick}>Discard</a>);
            buttons.push(<button key={1} style={styles.button} className="btn btn-primary btn-outline" type="submit">
                Save</button >);
        } else {
            buttons.push(<a key={2} style={styles.button} className="btn btn-primary btn-outline"
                            onClick={this.handleToggleClick}>Edit Account</a>);
			if(this.data.user && !this.data.user.isCompanyAdmin()) {
				buttons.push(<a key={3} style={styles.button} className="btn btn-primary btn-outline" onClick={this.handleShowChangePassword}>Change Password</a>);
				buttons.push(<ChangePasswordDialog onDismiss={this.handleDismissChangePassword} show={this.state.showChangePassword} />)
			}
        }

        return (
            <div className="ibox-content m-t">
                <div id="email-address">
                    <div className="panel-body row">
                        <div className="col-sm-10">
                            <div className="animated fadeInRight">
                                <div className="content">
                                    <h2>
                                        <span className="circle-wrapper">
                                            <i className="fa fa-fw fa-envelope"></i>
                                        </span>
                                        Account Information
                                    </h2>

                                    <div className="alert hide"></div>
                                    <fieldset>
                                        <div className="form-horizontal">
                                            <div className="form-group">
                                                <label className="col-sm-3 control-label"></label>

                                                <div className="col-sm-9">
                                                    <Avatar userId={this.data.userId} upload={true}/>
                                                </div>
                                            </div>
                                        </div>

                                        <form className="form-horizontal" onSubmit={this.handleSaveClick}>
                                            <div className="form-group">
                                                <label className="col-sm-3 control-label">First Name</label>

                                                <div className="col-sm-9">
                                                    {this.state.isEditing
                                                        ? <input ref="firstname" type="text" className="form-control"
                                                                 defaultValue={this.firstName()}/>
                                                        : <p className="form-control-static">{this.firstName()}</p> }
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="col-sm-3 control-label">Last Name</label>

                                                <div className="col-sm-9">
                                                    {this.state.isEditing
                                                        ? <input ref="lastname" type="text" className="form-control"
                                                                 defaultValue={this.lastName()}/>
                                                        : <p className="form-control-static">{this.lastName()}</p> }
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="col-sm-3 control-label">Email Address</label>

                                                <div className="col-sm-9">
                                                    <p className="form-control-static">
                                                        {this.email()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="col-sm-3 control-label">Username</label>

                                                <div className="col-sm-9">
                                                    <p className="form-control-static">{this.username()}</p>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="col-sm-3 control-label">Mail signature</label>

                                                <div className="col-sm-9">
                                                    <div style={{border:'1px solid #eee', padding: '10px'}}>
                                                        <div ref={'editor'}
                                                             dangerouslySetInnerHTML={{__html: this.mailSignature()}}></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="col-sm-3 control-label"/>

                                                <div className="col-sm-9">
                                                    <div className="buttons">
                                                        {buttons}
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});