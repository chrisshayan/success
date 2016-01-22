CommentBox = React.createClass({
    componentWillMount() {
        this.props.actions.changeTab(2);
    },

    componentDidMount() {
        var body = $("html, body");
        let container = $("#job-candidate-content");
        let actionContainer = $('.job-candidate-actions');
        let ip = this.refs.txt();
        let scrollTo = 0;
        if(actionContainer && actionContainer.hasClass('affix')) {
            scrollTo = container.offset().top - 45;
        } else {
            scrollTo = container.offset().top - 50 - 45;
        }
        //autosize(ip);

        body.stop().animate({scrollTop: scrollTo}, '500', 'swing', function() {
            ip.focus();
        });
    },

    handleSaveClick(e) {
        e.preventDefault();
        const val = this.refs.txt.getValue();
        this.props.onSave && this.props.onSave(val);
    },

    render() {
        let styles = {
            container: {
                marginBottom: "20px",
                borderTop: 'none'
            },
            input: {
                width: '100%',
                height: 'auto',
                border: '1px solid #eee'
            },
            actions: {
                margin: '5px 0'
            }
        };
        return (
            <div ref="container" style={styles.container}>
                <MentionInput ref="txt" placeholder="write your note or comment (mention someone using '@')" />

                <div className="text-right" style={styles.actions}>
                    <button className="btn btn-primary btn-outline btn-sm" onClick={this.handleSaveClick}>
                        <i className="fa fa-paper-plane-o"/>&nbsp;
                        Save
                    </button>
                    &nbsp;&nbsp;
                    <button className="btn btn-white btn-outline btn-sm" onClick={this.props.onDiscard}>
                        <i className="fa fa-times"/>&nbsp;
                        Discard
                    </button>
                </div>
            </div>
        );
    }
})