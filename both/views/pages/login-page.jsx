LoginForm = toReact("loginForm");

LoginPage = React.createClass({
    render() {
        return (
            <div className="loginColumns animated fadeInDown">
                <div className="row">
                    <div className="col-md-6">
                        <h2 className="font-bold">Welcome to Recruit</h2>

                        <p>You are one step away from great recruiting soluction.</p>

                        <p>No missing emails, goodbye spreadsheets. Resumes are automatically stored in your secure
                            candidate browser, accessible on your laptop, desktop or the smartphone in your pocket.
                            Never miss a great candidate.</p>

                        <p>
                            <small>Login with your VietnamWorks account and start using Recruit.</small>
                        </p>
                    </div>

                    <div className="col-md-6">
                        <div className="ibox-content">
                            <h3>Login here (VietnamWorks Account)</h3>
                            <LoginForm />
                        </div>
                    </div>
                </div>
                <hr/>
                <div className="row">
                    <div className="col-md-6">
                        <strong>&copy; 2015 Navigos Group Vietnam Joint Stock Company</strong><br/>
                    </div>
                    <div className="col-md-6">
                        <small>© 2015</small>
                    </div>
                </div>
            </div>
        );
    }
});