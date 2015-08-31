BlankLayout = React.createClass({
    componentDidMount() {
        $('body').addClass('gray-bg');
    },

    componentWillUnmount() {
        $('body').removeClass('gray-bg');
    },


    render() {
        return this.props.content;
    }
});