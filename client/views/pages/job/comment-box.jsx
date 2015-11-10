CommentBox = React.createClass({
    componentDidMount() {
        let container = this.refs.container.getDOMNode();
        let ip = this.refs.input.getDOMNode();
        let scrollTo = $(container).offset().top - $(container).height() - 64;

        $('body').animate({
            scrollTop: scrollTo
        }, 'slow');

        autosize(ip);
    },

    componentWillUnmount() {
        let el = this.refs.container.getDOMNode();
        var evt = document.createEvent('Event');
        evt.initEvent('autosize:destroy', true, false);
        el.dispatchEvent(evt);
    },

    handleSaveClick(e) {
        e.preventDefault();
        let ip = this.refs.input.getDOMNode();
        this.props.onSave && this.props.onSave(ip.value);
        ip.value = '';
    },

    handleDiscardClick(e) {
        e.preventDefault();
        let ip = this.refs.input.getDOMNode();
        ip.value = '';
        this.props.onDiscard && this.props.onDiscard();
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
                    ref="input"
                    className="form-control"
                    style={styles.input}
                    placeholder="write your note or comment">

                </textarea>
                <div className="text-right" style={styles.actions}>
                    <button className="btn btn-primary btn-outline btn-sm" onClick={this.handleSaveClick}>
                        <i className="fa fa-paper-plane-o" />&nbsp;
                        Save
                    </button>&nbsp;&nbsp;
                    <button className="btn btn-white btn-outline btn-sm"  onClick={this.handleDiscardClick}>
                        <i className="fa fa-times" />&nbsp;
                        Discard
                    </button>
                </div>
            </div>
        );
    }
})