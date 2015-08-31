JobsList = React.createClass({
    render() {
        return (
            <div className="row" style={{marginTop: "20px"}}>
                <div className="col-md-12">
                    <h3><i className="fa {this.props.icon}"></i>&nbsp;{this.props.title} (11)</h3>

                    <div className="jobs-list">
                        <JobItem />
                        <JobItem />
                        <JobItem />
                        <JobItem />
                    </div>
                </div>
            </div>
        );
    },

    renderEmpty: function () {
        return (
            <div className="empty-jobs">
                <h3 className="empty-message">{this.props.emptyMsg}</h3>
            </div>
        );
    },
});