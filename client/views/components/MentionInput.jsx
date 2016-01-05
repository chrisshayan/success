MentionInput = React.createClass({
	getInitialState() {
		return {
			users:     [],
			isLoading: false
		}
	},

	componentDidMount() {
		this.fetchUsers();
	},

	componentWillUnmount() {

	},

	fetchUsers() {
		var isLoading = true;
		this.setState({isLoading});
		Meteor.call('hiringTeam.recruiters', (err, users) => {
			isLoading = false;
			this.setState({users, isLoading});
			this.initMention();
			setTimeout(() => {
				this.initHighLight();
			}, 500);
		});
	},

	initMention() {
		const el = this.refs.content;
		if (el) {
			const $el = $(el.getDOMNode());
			$el.mention({
				emptyQuery:    true,
				queryBy:       ['name', 'username'],
				typeaheadOpts: {
					items: 5
				},
				users:         this.state.users
			});

			$el.on('change', function (e) {
				e.preventDefault();
				$el.trigger('input');
			})
		}
	},

	initHighLight() {
		const el = this.refs.content;
		if (el) {
			$(el.getDOMNode()).textareaHighlighter({
				matches: [
					{
						match:      /\B@\w+/g,
						matchClass: 'mention people'
					},

					{
						match:      /\B#\w+/g,
						matchClass: 'mention hash'
					}
				]
			})
		}
	},

	getValue() {
		const el = this.refs.content;
		return el ? el.getDOMNode().value : '';
	},

	render() {
		const styles = {
			input: {
				width:           '100%',
				minHeight:       '48px',
				padding:         '3px 6px',
				lineHeight:      '24px',
				wordBreak:       'break-all',
				wordWrap:        'break-word',
				appearance:      'none',
				overflow:        'hidden',
				whiteSpace:      'pre-wrap',
				resize:          'none',
				backgroundColor: '#fff',
				border:          '1px solid #ddd',
				borderRadius:    '3px',
			}
		};
		styles.input = _.extend(styles.input, this.props.style || {});
		let textbox = null;
		if (this.props.value || this.props.onChange || this.props.onBlur) {
			textbox = <textarea
				ref='content'
				style={styles.input}
				placeholder={this.props.placeholder}
				value={this.props.value || ''}
				onChange={this.props.onChange || function(){} }
				onBlur={this.props.onBlur || function(){}}
				/>;
		} else {
			textbox = <textarea
				ref='content'
				style={styles.input}
				placeholder={this.props.placeholder}
				/>;
		}
		return (
			<div>
				{textbox}
			</div>
		);
	}
});
