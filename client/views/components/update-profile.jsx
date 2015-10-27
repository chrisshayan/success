var LinkedStateMixin = React.addons.LinkedStateMixin;

UpdateProfileForm = React.createClass({
    mixins: [ReactMeteorData, LinkedStateMixin],

    getInitialState() {
        return {
            isEditing: false
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

    handleToggleClick(e) {
        this.setState({
            isEditing: !this.state.isEditing
        });
        e.preventDefault();
    },

    handleSaveClick(e) {
        e.preventDefault();
        var firstname = this.refs.firstname.getDOMNode().value;
        var lastname = this.refs.lastname.getDOMNode().value;
        Meteor.users.update({_id: this.data.userId}, {
            $set: {
                "profile.lastname": lastname,
                "profile.firstname": firstname
            }
        });

        this.setState({
            isEditing: false
        });
        return;
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
            buttons.push(<a key={0} style={styles.button} className="btn btn-white" onClick={this.handleToggleClick}>Discard</a>);
            buttons.push(<button  key={1} style={styles.button} className="btn btn-white" type="submit">Save</button >);
        } else {
            buttons.push(<a key={2} style={styles.button} className="btn btn-white" onClick={this.handleToggleClick}>Edit</a>);
        }

        return (

            <div style={styles.container}>
                <div className="form-group">
                    <label className="col-lg-2 control-label"></label>

                    <div className="col-lg-10">
                        <p className="form-control-static">
                            <Avatar userId={this.data.userId} upload={true}/>
                        </p>
                    </div>
                </div>
                <form onSubmit={this.handleSaveClick} className="form-horizontal">
                    <div className="hr-line-dashed"></div>

                    <div className="form-group">
                        <label className="col-lg-2 control-label">First name</label>

                        <div className="col-lg-10">
                            {this.state.isEditing
                                ? <input ref="firstname" type="text" className="form-control" defaultValue={this.firstName()}/>
                                : <p className="form-control-static">{this.firstName()}</p> }
                        </div>
                    </div>

                    <div className="hr-line-dashed"></div>

                    <div className="form-group">
                        <label className="col-lg-2 control-label">Last name</label>

                        <div className="col-lg-10">
                            {this.state.isEditing
                                ? <input ref="lastname" type="text" className="form-control" defaultValue={this.lastName()}/>
                                : <p className="form-control-static">{this.lastName()}</p> }
                        </div>
                    </div>

                    <div className="hr-line-dashed"></div>

                    <div className="form-group">
                        <label className="col-lg-2 control-label">Username</label>

                        <div className="col-lg-10">
                            <p className="form-control-static">{this.username()}</p>
                        </div>
                    </div>


                    <div className="hr-line-dashed"></div>

                    <div className="form-group">
                        <label className="col-lg-2 control-label">Email</label>

                        <div className="col-lg-10">
                            <p className="form-control-static">{this.email()}</p>
                        </div>
                    </div>

                    <div className="hr-line-dashed"></div>

                    <div className="form-group">
                        <label className="col-lg-2 control-label"></label>

                        <div className="col-lg-10">
                            {buttons}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
});