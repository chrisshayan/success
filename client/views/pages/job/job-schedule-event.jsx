ScheduleEvent = React.createClass({
    componentDidMount() {
        let container = this.refs.container.getDOMNode();
        let scrollTo = $(container).offset().top - 140;
        $('body').animate({
            scrollTop: scrollTo
        }, 'slow');

    },

    render() {
        return (
            <div ref="container">
                <h1>Schedule interview</h1>
            </div>
        );
    }
});