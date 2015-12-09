CommentBox = React.createClass({
    componentWillMount() {
        this.props.actions.changeTab(2);
    },

    componentDidMount() {
        var body = $("html, body");
        let container = $("#job-candidate-content");
        let actionContainer = $('.job-candidate-actions');
        let ip = this.refs.txt.getDOMNode();
        let scrollTo = 0;
        if(actionContainer && actionContainer.hasClass('affix')) {
            scrollTo = container.offset().top - 45;
        } else {
            scrollTo = container.offset().top - 50 - 45;
        }
        autosize(ip);

        body.stop().animate({scrollTop: scrollTo}, '500', 'swing', function() {
            ip.focus();
        });
    },

    componentWillUnmount() {
        let el = this.refs.container.getDOMNode();
        var evt = document.createEvent('Event');
        evt.initEvent('autosize:destroy', true, false);
        el.dispatchEvent(evt);
    },

    handleSaveClick(e) {
        e.preventDefault();
        let ip = this.refs.txt.getDOMNode();
        this.props.onSave && this.props.onSave(ip.value);
        ip.value = '';
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
                <textarea
                    ref="txt"
                    className="form-control"
                    style={styles.input}
                    placeholder="write your note or comment">

                </textarea>
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