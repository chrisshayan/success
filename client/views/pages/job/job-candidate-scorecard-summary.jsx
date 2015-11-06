
ScorecardOverallChart = React.createClass({
    componentDidMount() {
        CanvasJS.addColorSet("scoreCard",
            [
                "#DC3F59",
                "#EE8F9E",
                "#77D5D1",
                "#00B2AA"
            ]);

        var chart = new CanvasJS.Chart("chartContainer",
            {
                colorSet: "scoreCard",
                title: {
                    text: ""
                },
                legend: {
                    maxWidth: 350,
                    itemWidth: 120
                },
                data: [
                    {
                        type: "pie",
                        showInLegend: true,
                        legendText: "{indexLabel}",
                        dataPoints: [
                            {y: _.random(1,10), indexLabel: "Definitely Not"},
                            {y: _.random(1,10), indexLabel: "No"},
                            {y: _.random(1,10), indexLabel: "Yes"},
                            {y: _.random(1,10), indexLabel: "Strong Yes"}
                        ]
                    }
                ]
            });
        chart.render();
    },
    render() {
        return (
            <div id="chartContainer" style={{height: '400px', width: '80%'}}></div>
        );
    }
})


JobCandidateScorecardSummary = React.createClass({

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="ibox">
                            <div className="ibox-content">
                                <h2><i className="fa  fa-pie-chart"/>&nbsp;OVERALL RECOMMENDATION</h2>
                                <ScorecardOverallChart />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="ibox">
                            <div className="ibox-content">
                                <h2><i className="fa fa-graduation-cap"/>&nbsp;CORE SKILLS</h2>
                                <table className="table table-bordered">
                                    <tbody>
                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="ibox">
                            <div className="ibox-content">
                                <h2><i className="fa fa-check-square-o"/>&nbsp;QUALIFICATIONS</h2>
                                <table className="table table-bordered">
                                    <tbody>
                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="ibox">
                            <div className="ibox-content">
                                <h2><i className="fa  fa-puzzle-piece"/>&nbsp;PERSONAL TRAITS</h2>
                                <table className="table table-bordered">
                                    <tbody>
                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="ibox">
                            <div className="ibox-content">
                                <h2><i className="fa fa-list-alt"/>&nbsp;DETAILS</h2>
                                <table className="table table-bordered">
                                    <tbody>
                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td width="40%">Android</td>
                                        <td>
                                            <span className='score-icon score-yes'><i
                                                className="fa fa-thumbs-o-up"/></span>
                                            <span className='score-icon score-definitely-not'><i
                                                className="fa fa-times-circle-o"/></span>
                                            <span className='score-icon score-no'><i
                                                className="fa fa-thumbs-o-down"/></span>
                                            <span className='score-icon score-strong-yes'><i className="fa fa-star-o"/></span>
                                            <span className='score-icon score-neutral'><i
                                                className="fa fa-minus-circle"/></span>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="ibox">
                            <div className="ibox-content">
                                <h2><i className="fa  fa-key"/>&nbsp;KEY TAKE-AWAYS</h2>
                                <div>
                                    <blockquote>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat
                                            a ante.</p>
                                        <small>Written by <strong>Eduardo Mora</strong> on <cite title=""
                                                                                                 data-original-title="">15:00
                                            20/09/2015</cite></small>
                                    </blockquote>
                                </div>
                                <div>
                                    <blockquote>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat
                                            a ante.</p>
                                        <small>Written by <strong>Eduardo Mora</strong> on <cite title=""
                                                                                                 data-original-title="">15:00
                                            20/09/2015</cite></small>
                                    </blockquote>
                                </div>
                                <div>
                                    <blockquote>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat
                                            a ante.</p>
                                        <small>Written by <strong>Eduardo Mora</strong> on <cite title=""
                                                                                                 data-original-title="">15:00
                                            20/09/2015</cite></small>
                                    </blockquote>
                                </div>
                                <div>
                                    <blockquote>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat
                                            a ante.</p>
                                        <small>Written by <strong>Eduardo Mora</strong> on <cite title=""
                                                                                                 data-original-title="">15:00
                                            20/09/2015</cite></small>
                                    </blockquote>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="ibox">
                            <div className="ibox-content">
                                <h2><i className="fa fa-building-o"/>&nbsp;COMPANY CULTURE FIT COMMENTS</h2>
                                <div>
                                    <blockquote>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat
                                            a ante.</p>
                                        <small>Written by <strong>Eduardo Mora</strong> on <cite title=""
                                                                                                 data-original-title="">15:00
                                            20/09/2015</cite></small>
                                    </blockquote>
                                </div>
                                <div>
                                    <blockquote>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat
                                            a ante.</p>
                                        <small>Written by <strong>Eduardo Mora</strong> on <cite title=""
                                                                                                 data-original-title="">15:00
                                            20/09/2015</cite></small>
                                    </blockquote>
                                </div>
                                <div>
                                    <blockquote>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat
                                            a ante.</p>
                                        <small>Written by <strong>Eduardo Mora</strong> on <cite title=""
                                                                                                 data-original-title="">15:00
                                            20/09/2015</cite></small>
                                    </blockquote>
                                </div>
                                <div>
                                    <blockquote>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat
                                            a ante.</p>
                                        <small>Written by <strong>Eduardo Mora</strong> on <cite title=""
                                                                                                 data-original-title="">15:00
                                            20/09/2015</cite></small>
                                    </blockquote>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});