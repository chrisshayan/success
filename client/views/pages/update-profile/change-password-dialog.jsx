const {Modal, Button} = ReactBootstrap;

ChangePasswordForm = Astro.Class({
    name: 'ChangePasswordForm',
    fields: {
        currentPassword: {
            type: 'string',
            validator: [
                Validators.string(),
                Validators.required('You can\'t leave this empty.')
            ]
        },

        password: {
            type: 'string',
            validator: [
                Validators.string(),
                Validators.required('You can\'t leave this empty.')
            ]
        },

        rePassword: {
            type: 'string',
            validator: [
                Validators.string(),
                Validators.required('You can\'t leave this empty.'),
                Validators.equalTo('password', 'Password does not match the repeat password.')
            ]
        }
    }
})

ChangePasswordDialog = React.createClass({

    getInitialState() {
        return {
            isLoading: false,
            errors: {}
        }
    },

    componentDidMount() {
        const el = this.refs.dialog;
        $(el).modal({
            backdrop: true
        });
    },

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.show != this.props.show) {
            this.reset();
        }
    },

    reset() {
        const {currentPassword, password, rePassword} = this.refs;

        this.setState({isLoading: false, errors: {}});
        currentPassword.clear();
        password.clear();
        rePassword.clear();
        currentPassword.focus();
    },

    handleSubmit(e) {
        e.preventDefault();
        const {currentPassword, password, rePassword} = this.refs;
        const model = new ChangePasswordForm({
            currentPassword: currentPassword.value(),
            password: password.value(),
            rePassword: rePassword.value()
        });

        if (model.validate()) {
            this.setState({isLoading: true});

            Accounts.changePassword(model.currentPassword, model.password, (err) => {
                this.setState({isLoading: false});
                if (err) {
                    this.setState({
                        errors: {
                            currentPassword: err.reason
                        }
                    });
                    this.refs.currentPassword.focus();

                } else {
                    Notification.success('Updated password');
                    this.props.onDismiss && this.props.onDismiss();
                }
            });
        } else {
            this.setState({
                isLoading: false,
                errors: model.getValidationErrors()
            });
        }
    },

    handleClose() {
        this.props.onDismiss && this.props.onDismiss();
    },

    render() {
        const {isLoading, errors} = this.state;

        return (
            <Modal show={this.props.show}>
                <Modal.Header>
                    <Modal.Title>Set new password</Modal.Title>
                </Modal.Header>
                <Modal.Body className="clearfix">
                    <form onSubmit={this.handleSubmit} className="form-horizontal">
                        <FormInput
                            ref='currentPassword'
                            label='Current password'
                            type='password'
                            disabled={ isLoading }
                            error={errors.currentPassword}/>

                        <FormInput
                            ref='password'
                            label='New password'
                            type='password'
                            disabled={ isLoading }
                            error={errors.password}/>

                        <FormInput
                            ref='rePassword'
                            label='Repeat password'
                            type='password'
                            disabled={ isLoading }
                            error={errors.rePassword}/>

                        <button type="submit" className="hidden"></button>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.handleClose}>Close</Button>
                    <Button bsStyle='primary' onClick={this.handleSubmit} disabled={this.state.isLoading}>
                        Change password
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
});