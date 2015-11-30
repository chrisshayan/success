MessageBox = React.createClass({
    propsType: {
        appIds: React.PropTypes.array.isRequired
    },

    getInitialState() {
        return {
            isLoading: false,
            emails: [],
            templates: []
        };
    },

    componentDidMount() {
        let container = this.refs.container.getDOMNode();
        let scrollTo = $(container).offset().top - 140;
        $('body').animate({
            scrollTop: scrollTo
        }, 'slow');


        if(!_.isEmpty(this.props.appIds)) {
            this.setState({ isLoading: true });
            Meteor.call('getSendMessageData', this.props.appIds, (err, data) => {
                if(!err) {
                    this.setState({
                        isLoading: false,
                        emails: data.emails,
                        templates: data.templates
                    });
                }
            });
        }
    },

    handleSendClick(e) {

    },

    handleDiscardClick(e) {

    },


    render() {
        let content = null;
        if(this.state.isLoading) {
            content = <WaveLoading />;
        } else {
            content = <MailComposer
                        emails={this.state.emails}
                        templates={this.state.templates}
                        onSave={this.props.onSave}
                        onDiscard={this.props.onDiscard} />;
        }
        return (
            <div ref="container">
                { content }
            </div>
        );
    }
});