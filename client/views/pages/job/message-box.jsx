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

    componentWillMount() {
        this.props.actions.changeTab(2);
    },

    componentDidMount() {
        let container = $("#job-candidate-content");
        if(container.length) {
            let actionContainer = $('.job-candidate-actions');
            var body = $("html, body");
            let scrollTo = 0;
            if(actionContainer && actionContainer.hasClass('affix')) {
                scrollTo = container.offset().top - 45;
            } else {
                scrollTo = container.offset().top - 50 - 45;
            }
            body.stop().animate({scrollTop: scrollTo}, '500', 'swing');
        }

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