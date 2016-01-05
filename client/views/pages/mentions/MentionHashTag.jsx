MentionHashTagContainer = React.createClass({
	mixins: [ReactMeteorData],

	getInitialState() {
		return {
			limit: 10
		};
	},

	getMeteorData() {
		const {hashtag} = Router.current().params;
		const cond = [
			{
				mentionType: Mention.MENTION_TYPE.HASHTAG,
				text:        hashtag
			},
			{
				limit: this.state.limit,
				sort:  {
					createdAt: -1
				}
			}
		];
		const sub = Meteor.subscribe('Mentions.Hashtag', ...cond);
		return {
			hashtag:   hashtag,
			isLoading: !sub.ready(),
			items:     Mention.find(...cond).fetch(),
			hasMore:   Mention.find(cond[0]).count() > this.state.limit,
		}
	},

	componentDidMount() {
		$("html, body").stop().animate({scrollTop: 0}, '500', 'swing');
	},

	handleLoadmore(e) {
		e.preventDefault();
		const limit = this.state.limit + 10;
		this.setState({limit});
	},

	reset() {
		this.setState({
			limit: 10
		});
	},

	render() {
		let loadingIcon = null;
		if(this.data.isLoading) {
			loadingIcon = <WaveLoading />;
		}
		return (
			<div className="row" style={{paddingBottom: '60px'}}>
				<div className="row wrapper border-bottom white-bg page-heading hidden-print">
					<div className="col-lg-12">
						<h2 className='text-center'>#{this.data.hashtag}</h2>
					</div>
				</div>
				<div style={{paddingTop: '20px'}}>

					<MentionHashTag
						hashtag={this.data.hashtag}
						isLoading={this.data.isLoading}
						items={this.data.items}
						hasMore={this.data.hasMore}
						onLoadMore={this.handleLoadmore}
						onReset={this.reset}/>

					{ loadingIcon }
				</div>
			</div>
		);
	}
});

MentionHashTag = React.createClass({
	componentDidUpdate(prevProps) {
		if (!_.isEqual(prevProps.hashtag, this.props.hashtag)) {
			this.props.onReset && this.props.onReset();
		}
	},

	render() {
		let loadMoreBtn = null;
		if (this.props.hasMore) {
			loadMoreBtn = (
				<button className="btn btn-small btn-primary btn-block" onClick={this.props.onLoadMore}>
					<i className="fa fa-arrow-down"/>
					{' '}
					<span>Load more</span>
				</button>
			);
		}
		return (
			<div className="animated fadeInUp">
				<div className="col-md-8 col-md-offset-2">
					<div className="feed-activity-list">
						{this.props.items.map(this.renderItem)}
					</div>
					{loadMoreBtn}
				</div>
			</div>
		);
	},

	renderItem(mention, key) {
		return <MentionHashTagItem mention={mention} key={key}/>;
	}
});

MentionHashTagItem = React.createClass({
	render() {
		const mention = this.props.mention;
		const creator = mention.creator();
		const job = mention.getRef('job');

		return (
			<div className="social-feed-box">
				<div className="social-avatar">
					<a href="" className="pull-left avatar-box">
						<Avatar upload={false} userId={mention.createdBy} width={32} height={32}/>
					</a>

					<div className="media-body">
						<div>
							<span>{ creator && creator.fullname() }</span>&nbsp;
							<span className="text-muted small">{ 'mention in' }</span>

							<span style={{fontSize: '16px', margin: '0 5px'}}>
								<i className="fa fa-caret-right"/>
							</span>
							<a href={ job ? job.link() : '#' } style={{display: 'inline-block'}}>
								<b>{ job ? job.jobTitle : '' }</b>
							</a>
						</div>
						<small className="text-muted">{ mention.time()}</small >
					</div>
				</div>

				<div className="social-body">
					<div className="activity-info">
						<MentionContent content={mention.embed}/>
					</div>
				</div>
			</div>
		);
	}
});