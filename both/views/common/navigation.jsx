Navigation = React.createClass({
    componentDidMount() {
        $('#side-menu').metisMenu();
    },

    render() {
        return (
            <nav className="navbar-default navbar-static-side" role="navigation">
                <div className="sidebar-collapse">
                    <a className="close-canvas-menu"><i className="fa fa-times"></i></a>

                    <ul className="nav" id="side-menu">
                        <li className="nav-header">
                            <div className="dropdown profile-element">
                                <a href="#">
                                    <span className="clear">
                                        <span className="block m-t-xs">
                                            <div>
                                                <img src="http://images.vietnamworks.com/img/jobseekers/logo.png" alt="" width="100%"/>
                                            </div>
                                            <strong className="font-bold">Vietnamworks</strong>
                                        </span>
                                    </span>
                                </a>
                            </div>
                            <div className="logo-element">
                                IN+
                            </div>
                        </li>
                        <li className="active">
                            <a href="#"><i className="fa fa-dashboard"></i> <span className="nav-label">Dashboard</span>
                            </a>
                        </li>
                        <li>
                            <a href="#"><i className="fa fa-users"></i> <span className="nav-label">Candidates</span>
                            </a>
                        </li>
                        <li>
                            <a href="#"><i className="fa fa-heartbeat"></i> <span className="nav-label">Activities</span>
                            </a>
                        </li>
                        <li>
                            <a href="#"><i className="fa fa-area-chart"></i> <span className="nav-label">Reports</span>
                            </a>
                        </li>
                        <li>
                            <a href="#"><i className="fa fa-cogs"></i> <span className="nav-label">Settings</span>
                            </a>
                        </li>
                    </ul>

                </div>
            </nav>
        );
    }
});