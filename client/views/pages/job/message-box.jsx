MessageBox = React.createClass({
    componentDidMount() {
        let container = this.refs.container.getDOMNode();
        let scrollTo = $(container).offset().top - 140;
        console.log(scrollTo)
        $('body').animate({
            scrollTop: scrollTo
        }, 'slow');

    },

    handleSendClick(e) {

    },

    handleDiscardClick(e) {

    },


    render() {
        return (
            <div ref="container">
                <MailComposer to={this.props.to} onDiscard={this.props.onDiscard} />
            </div>
        );
    }
});