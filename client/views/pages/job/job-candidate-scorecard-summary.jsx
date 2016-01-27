ScorecardOverallChart = React.createClass({
	componentDidMount() {
		//this.updateChart();
	},

	componentDidUpdate(prevProps) {
		if (!_.isEqual(prevProps, this.props)) {
			console.log(this.refs.chart);
		}
	},

	data() {
		let hasData = false;
		let data = {
			'1': {
				name: "Definitely Not",
				y: 0
			},
			'2': {
				name: "No",
				y: 0
			},
			'3': {
				name: "Yes",
				y: 0
			},
			'4': {
				name: "Strong Yes",
				y: 0
			}
		};
		const overall = _.groupBy(this.props.summary.overalls, 'value');
		_.each(overall, (val, id) => {
			if(data[id]) {
				data[id].y = val.length;
				hasData = true;
			}
		});

		return hasData ? _.toArray(data) : [];
	},

	config() {
		return {
			title: {
				text: 'OVERALL RECOMMENDATION'
			},
			chart: {
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false,
				type: 'pie'
			},
			tooltip: {
				pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					showInLegend: true,
					dataLabels: {
						enabled: true,
						format: '<b>{point.name}</b>: {point.percentage:.1f} %',
						style: {
							color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
						}
					}
				}
			},
			series: [{
				name: "Votes",
				colorByPoint: true,
				colors: ["#DC3F59", "#EE8F9E", "#77D5D1", "#00B2AA"],
				data: this.data(),
			}],
			credits: {
				enabled: false
			},
		};
	},

	render() {
		return (
			<ReactHighcharts config={this.config()} ref="chart"></ReactHighcharts>
		);
	}
});

JobCandidateScorecardSummary = React.createClass({
	mixins: [ReactMeteorData],
	getMeteorData() {
		if (!this.props.application) return {isReady: true, summary: null};
		const app = this.props.application;
		const cond = {
			"ref.appId": app.appId,
			"ref.type": app.type
		};
		const isReady = Meteor.subscribe('scorecardSummary', cond).ready();
		return {
			isReady: isReady,
			summary: SummaryCollection.findOne(cond)
		};
	},
	componentDidMount() {

	},

	getCriteriaSet(type) {
		if (this.data.summary && this.data.summary['all_score_criteria']) {
			const criteriaSets = _.groupBy(this.data.summary['all_score_criteria'], 'type');
			if (criteriaSets[type]) return criteriaSets[type];
		}
		return [];
	},

	getNotes(type) {
		if (this.data.summary && this.data.summary['notes']) {
			const notes = _.groupBy(this.data.summary['notes'], 'type');
			if (notes[type]) return notes[type];
		}
		return [];
	},

	renderEmpty() {
		const style = {
			border: '1px dashed #ccc',
			color: '#aaa',
			fontWeight: 'lighter',
			fontSize: '20px',
			padding: '20px'
		};
		return <h1 style={style}>There is no data!</h1>;
	},

	renderContent() {

		return (
			<div>
				<div className="row">
					<div className="col-md-12">
						<div className="ibox">
							<div className="ibox-content">
								<ScorecardOverallChart summary={this.data.summary}/>
							</div>
						</div>
					</div>
				</div>

				<ScoreCardSummaryCriteriaSet name="Skills" criteria={this.getCriteriaSet('skills')}/>
				<ScoreCardSummaryCriteriaSet name="Personality Traits"
				                             criteria={this.getCriteriaSet('personalityTraits')}/>
				<ScoreCardSummaryCriteriaSet name="Qualifications" criteria={this.getCriteriaSet('qualifications')}/>
				<ScoreCardSummaryCriteriaSet name="Details" criteria={this.getCriteriaSet('details')}/>

				<ScoreCardSummaryNotes name="KEY TAKE-AWAYS" notes={this.getNotes('keyTakeAways')} icon="fa fa-key"/>
				<ScoreCardSummaryNotes name="COMPANY CULTURE FIT COMMENTS" notes={this.getNotes('fitCompanyCulture')}
				                       icon="fa fa-building-o"/>
			</div>
		);
	},

	render() {
		let content = null;
		if (!this.data.isReady) {
			content = <WaveLoading />;
		} else {
			if (!this.data.summary) {
				content = this.renderEmpty();
			} else {
				content = this.renderContent();
			}
		}
		return content;
	}
});

ScoreCardSummaryCriteriaSet = React.createClass({
	getInitialState() {
		return {
			items: []
		}
	},

	componentDidMount() {
		if (!_.isEmpty(this.props.criteria)) {
			const items = [];
			const group = _.groupBy(this.props.criteria, 'name');
			_.each(group, function (item, name) {
				items.push({
					name: name,
					items: item || []
				});
			});
			this.setState({items});
		}
	},

	renderCriteria(item, key) {
		let content = null;

		if (_.isEmpty(item.items)) {
			content = this.renderNoSummitted();
		} else {
			content = item.items.map(this.renderPointIcon);
		}
		return (
			<tr key={ key }>
				<td width="40%"><span style={{textTransform: 'capitalize'}}>{ item.name }</span></td>
				<td>
					{content}
				</td>
			</tr>

		);
	},

	renderPointIcon(item, key) {
		let labelClass = '';
		let iconClass = '';

		switch (item.point) {
			case 1:
				labelClass = 'score-icon score-definitely-not';
				iconClass = 'fa fa-times-circle-o';
				break;
			case 2:
				labelClass = 'score-icon score-no';
				iconClass = 'fa fa-thumbs-o-down';
				break;
			case 3:
				labelClass = 'score-icon score-neutral';
				iconClass = 'fa fa-minus-circle';
				break;
			case 4:
				labelClass = 'score-icon score-yes';
				iconClass = 'fa fa-thumbs-o-up';
				break;
			case 5:
				labelClass = 'score-icon score-strong-yes';
				iconClass = 'fa fa-star-o';
				break;
		}

		return (
			<span className={labelClass} key={key}>
                <i className={iconClass}/>
            </span>
		);
	},

	renderNoSummitted() {
		return <p className="text-muted">No submitted ratings</p>;
	},

	renderNoCriteria() {
		const style = {
			padding: '5px'
		};
		return (
			<tr>
				<td colSpan={2}>
					<p className="text-muted" style={style}>There is no criteria</p>
				</td>
			</tr>
		);
	},

	render() {
		let content = null;
		if (this.state.items.length > 0) {
			content = this.state.items.map(this.renderCriteria);
		} else {
			content = this.renderNoCriteria();
		}
		return (
			<div className="row">
				<div className="col-md-12">
					<div className="ibox">
						<div className="ibox-content">
							<h2>{this.props.name}</h2>
							<table className="table table-bordered">
								<tbody>
								{ content }
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

ScoreCardSummaryNotes = React.createClass({
	componentDidMount() {

	},
	renderNote(note, key) {
		return (
			<div key={key}>
				<blockquote>
					<p>{note.content}</p>
				</blockquote>
			</div>
		);
	},
	render() {
		return (
			<div className="row">
				<div className="col-md-12">
					<div className="ibox">
						<div className="ibox-content">
							<h2><i className={ this.props.icon }/>&nbsp;{ this.props.name }</h2>

							<div>
								{this.props.notes && (this.props.notes.map(this.renderNote))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
});