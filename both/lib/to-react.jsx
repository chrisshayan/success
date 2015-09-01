toReact = function(templateName) {
    try {
        return React.createClass({
            componentDidMount() {
                var el = this.getDOMNode();
                Blaze.renderWithData(Template[templateName], ...this.props, el);
            },
            render() {
                return <span />;
            }
        })
    } catch(e) {
        throw e;
    }

}