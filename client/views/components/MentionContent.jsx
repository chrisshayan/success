MentionContent = React.createClass({

	content() {
		let html = this.props.content || '';
		html = html
				.replace(/(\B(\@[\w\d\.]+))/g, '<span class="mention people">$1</span>')
				.replace(/(\B#\w+)/g, '<a class="mention hash" href="/hashtag/$1">$1</a>')
				.replace(/hashtag\/\#/g, 'hashtag/')
				.replace(/(\n|\r\n)/g, '<br/>');

		return {
			__html: html
		}
	},

	render() {
		return (
			<div ref="content" style={{lineHeight: '24px'}} dangerouslySetInnerHTML={this.content()} />
		);
	}
})