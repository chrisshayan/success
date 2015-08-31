JobItem = React.createClass({
    render() {
        return (
            <div className="job">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <div className="panel-title clearfix">
                            <h3 className="pull-left job-title">
                                <a href="/job">Meteor developer</a>
                            </h3>
                            <span className="pull-right job-posted-timeago">From 01/08/2015 to 30/08/2015</span>
                        </div>
                    </div>
                    <div className="job-stages">
                        <div className="row">
                            <div className="col-md-2 col-sm-2 col-xs-4 stage stage-sourced">
                                <a href="#" className="stage-number">1</a>
                                <a href="#" className="stage-label">Sourced</a>
                            </div>

                            <div className="col-md-2 col-sm-2 col-xs-4 stage stage-applied">
                                <a href="#" className="stage-number">1</a>
                                <a href="#" className="stage-label">Applied</a>
                            </div>

                            <div className="col-md-2 col-sm-2 col-xs-4 stage stage-phone">
                                <a href="#" className="stage-number">1</a>
                                <a href="#" className="stage-label">Phone</a>
                            </div>

                            <div className="col-md-2 col-sm-2 col-xs-4 stage stage-interview">
                                <a href="#" className="stage-number">1</a>
                                <a href="#" className="stage-label">Interview</a>
                            </div>

                            <div className="col-md-2 col-sm-2 col-xs-4 stage stage-offer">
                                <a href="#" className="stage-number">1</a>
                                <a href="#" className="stage-label">Offer</a>
                            </div>

                            <div className="col-md-2 col-sm-2 col-xs-4 stage stage-hired">
                                <a href="#" className="stage-number">1</a>
                                <a href="#" className="stage-label">Hired</a>
                            </div>

                        </div>
                    </div>
                    <div className="panel-footer clear">
                        <div className="pull-left job-actions" style={ {margin: "0 5px"} }>
                            <a href=""><i className="fa fa-eye"></i>&nbsp;view</a>
                            <a href=""><i className="fa fa-edit"></i>&nbsp;edit</a>
                        </div>

                        <div className="pull-right" style={ {margin: "0 5px"} }>
                            <i className="fa fa-map-marker"></i>&nbsp;Ho Chi Minh
                        </div>
                        <div className="pull-right job-keywords">
                            <span className="label label-default">js</span>
                            <span className="label label-default">html</span>
                            <span className="label label-default">css</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});