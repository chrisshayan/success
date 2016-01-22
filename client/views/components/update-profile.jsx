var LinkedStateMixin = React.addons.LinkedStateMixin;

updateProfileModel = Astro.Class({
    'name': 'updateProfile',
    fields: {
        /*email: {
         type: 'string',
         validator: [
         Validators.string(),
         Validators.required('You can\'t leave this empty.')
         ]
         },
         username: {
         type: 'string',
         validator: [
         Validators.string(),
         Validators.required('You can\'t leave this empty.')
         ]

         },*/
        firstName: {
            type: 'string',
            validator: [
                Validators.string(),
                Validators.required(null, 'First name is required.')
            ]
        },
        lastName: {
            type: 'string',
            validator: [
                Validators.string(),
                Validators.required(null, 'Last name is required.')
            ]
        },
        signature: {
            type: 'string',
            require: false
        }
    }
});


UpdateProfileForm = React.createClass({
    mixins: [ReactMeteorData, LinkedStateMixin],

    getInitialState() {
        return {
            isEditing: false,
            showChangePassword: false,
            errors: {},
            isLoading: false
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
            const editor = this.refs.editor();
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
        return user && user.profile && user.profile.firstname
            ? user.profile.firstname
            : '';
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
        this.setState({isLoading: false, errors: {}});

        // if isEdit == false : start edit page, saved the  textarea into variable originContent.
        // if isEdit == true  : finish edit page, revert the originContent into textarea.
        if (this.state.isEditing) {
            $(this.refs.editor).code(this.state.originContent);
            this.refs.firstName.reset();
            this.refs.lastName.reset();
        }
        else
            this.setState({
                originContent: $(this.refs.editor).code()
            });


        this.setState({
            isEditing: !this.state.isEditing
        });
        e.preventDefault();
    },

    handleSaveClick(e) {
        e.preventDefault();
        var model = new updateProfileModel({
            firstName: this.refs.firstName.value(),
            lastName: this.refs.lastName.value(),
            signature: $(this.refs.editor).code()
        });

        if (model.validate()) {
            this.setState({isLoading: true});

            Meteor.users.update({_id: this.data.userId}, {
                $set: {
                    "emailSignature": model.signature,
                    "profile.firstname": model.firstName,
                    "profile.lastname": model.lastName
                }
            });

            this.setState({isLoading: false, errors: {}});
            return this.setState({
                isEditing: false
            });

        } else {
            return this.setState({
                isLoading: false,
                errors: model.getValidationErrors()
            });

        }
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
                            onClick={this.handleToggleClick} disabled={this.state.isLoading}>Discard</a>);
            buttons.push(<button key={1} style={styles.button} className="btn btn-primary btn-outline" type="submit"
                                 disabled={this.state.isLoading}>
                Save</button >);
        } else {
            buttons.push(<a key={2} style={styles.button} className="btn btn-primary btn-outline"
                            onClick={this.handleToggleClick}>Edit Account</a>);
            if (this.data.user && !this.data.user.isCompanyAdmin()) {
                buttons.push(<a key={3} style={styles.button} className="btn btn-primary btn-outline"
                                onClick={this.handleShowChangePassword}>Change Password</a>);
                buttons.push(<ChangePasswordDialog key={4} onDismiss={this.handleDismissChangePassword}
                                                   show={this.state.showChangePassword}/>)
            }
        }

        const {isLoading, errors} = this.state;

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
                                            <FormInput
                                                ref='firstName'
                                                type='hidden'
                                                label="First name"
                                                disabled={ isLoading }
                                                value={this.firstName()}
                                                isStatic={this.state.isEditing}
                                                error={errors.firstName}/>

                                            <FormInput
                                                ref='lastName'
                                                type='hidden'
                                                disabled={ isLoading }
                                                label="Last name"
                                                value={ this.lastName()}
                                                isStatic={this.state.isEditing}
                                                error={errors.lastName}/>


                                            <div className="form-group">
                                                <div className="col-sm-3 control-label">
                                                    <label>Email Address</label>
                                                </div>

                                                <div className="col-sm-9">
                                                    <p className="form-control-static">
                                                        {this.email()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <div className="col-sm-3 control-label">
                                                    <label>Username</label>
                                                </div>
                                                <div className="col-sm-9">
                                                    <p className="form-control-static">{this.username()}</p>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <div className="col-sm-3 control-label">
                                                    <label>Mail signature</label>
                                                </div>

                                                <div className="col-sm-9">
                                                    <div style={{border:'1px solid #eee', padding: '10px'}}>
                                                        <div ref={'editor'}
                                                             dangerouslySetInnerHTML={{__html: this.mailSignature()}}></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <div className="col-sm-3 control-label">
                                                    <label/>
                                                </div>
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