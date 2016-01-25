ActiveAccountModel = Astro.Class({
    'name': 'activeAccountModel',
    fields: {
        key: {
            type: 'string',
            required: true
        },
        email: {
            type: 'string',
            validator: [
                Validators.string(),
                Validators.required(null, 'Email is required.')
            ]
        },
        username: {
            type: 'string',
            validator: [
                Validators.string(),
                Validators.required(null, 'Username is required.')
            ]

        },
        fullname: {
            type: 'string',
            validator: [
                Validators.string(),
                Validators.required(null, 'Full name is required.')
            ]
        },
        password: {
            type: 'string',
            optional: true,
            validator: [
                Validators.string(),
                Validators.required(null, 'Password is required.')
            ]
        }
    }
});


activeAccount = React.createClass({
    getInitialState () {
        return {
            token: Router.current().params['keyid'],
            info: null,
            isExistRecruiter: null,
            isLoading: false,
            errors: {}
        }
    },

    componentWillMount(){

    },
    componentDidMount() {
        var self = this;
        Meteor.call('getRequestInfo', this.state.token, (err, result) => {
            if (err) throw err;
            if (result.hiringTeamInfo) {
                self.setState({
                    info: result.hiringTeamInfo,
                    isExistRecruiter: !!result.isExistUser
                });
            }

            return this.state;
        });
    },

    callActiveAccount(doc){
        Meteor.call('activeAccount', doc, function (err, userId) {
            if (err) {
                console.log('Error %s :  %s', err.err, err.message);
                return false;
            }

            if (userId) {
                GAnalytics.event(['Recruiter', userId].join(':'),
                    'confirmed:hiring_Team_request'
                );

                if (doc.password)
                    Meteor.loginWithPassword(doc.email, doc.password, function (err, result) {
                        if (err) throw err;
                        Router.go('dashboard');
                    });
                else
                    Router.go('login');
            }
        });
    },

    doActivate(e){
        let self = this;
        e.preventDefault();
        var doc = {
            email: this.refs.email.value(),
            key: this.refs.key.value(),
            fullname: this.refs.name.value(),
            username: this.refs.username.value()
        };


        if (!this.state.isExistRecruiter)
            doc.password = this.refs.password.value();

        var model = new ActiveAccountModel(doc);

        if (model.validate()) {
            this.setState({isLoading: true, errors: {}});
            if (!this.state.isExistRecruiter) {
                Meteor.call("validateUserLoginInfo", doc.username, function (error, result) {
                    console.log('re user', error, result);
                    switch (result) {
                        case 0 :
                            self.callActiveAccount(doc);
                            break;
                        case 1 :
                            self.setState({
                                isLoading: false,
                                errors: {
                                    username: 'This username already existed.'
                                }
                            });
                            break;
                            self.setState({
                                isLoading: false,
                                errors: {
                                    username: 'This username already existed.'
                                }
                            });
                            break;
                        case 2 :
                        default:
                            self.setState({
                                isLoading: false,
                                errors: {
                                    username: "This username is invalid. Only allow characters, numbers and '.'"
                                }
                            });
                            break;
                    }
                    return result;


                });
            } else {
                this.callActiveAccount(doc);
            }


        } else {
            return this.setState({
                isLoading: false,
                errors: model.getValidationErrors()
            });

        }

    },

    formRender(info){
        let form = (<div></div>);
        const {isLoading, errors} = this.state;
        let pwdFormType = 'password'
            , pwdFormTitle = 'Password'
            , isDisableUsernameForm = false;

        if (this.state.isExistRecruiter) {
            pwdFormType = 'hidden';
            pwdFormTitle = '';
            isDisableUsernameForm = true;
        }

        form = (
            <form id="activeAccountForm" onSubmit={this.doActivate} className="form-horizontal">
                <FormInput
                    ref="key"
                    type="hidden"
                    label=""
                    value={info._id}
                    error=""/>
                <FormInput
                    ref="email"
                    type="text"
                    label="Email"
                    disabled={true}
                    value={info.email}
                    error=""/>
                <FormInput
                    ref="name"
                    type="text"
                    label="Fullname"
                    value={info.name}
                    error={errors.fullname}/>
                <FormInput
                    ref="username"
                    type="text"
                    label="Username"
                    disabled={isDisableUsernameForm}
                    value={info.username}
                    error={errors.username}/>
                <FormInput
                    ref="password"
                    type={pwdFormType}
                    label={pwdFormTitle}
                    error={errors.password}/>

                <div className="form-group">
                    <label className="col-sm-3 control-label"/>
                    <div className="col-sm-9">
                        <button type="submit"
                                disabled={isLoading}
                                className="btn btn-primary">
                            Submit
                        </button>
                    </div>

                </div>
            </form>);

        return form;
    },

    render(){
        var info = this.state.info;
        let content = '';

        if (info) {
            content = (
                <div className="col-md-6 col-md-offset-3 animated fadeInDown">
                    <div className="ibox">
                        <div className="ibox-content">
                            <h3 className="text-center">Your account's basic information</h3>
                            {this.formRender(info)}
                        </div>
                    </div>
                </div>)
        }


        return (
            <div className="row" style={{marginTop: '10%'}}>
                {content}
            </div>)
    }
});