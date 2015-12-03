const { PropTypes } = React;

TagSearch = React.createClass({
    propTypes: {
        onSelect: PropTypes.func
    },

    componentDidMount() {
        const $select = $(this.refs.q.getDOMNode());
        $select.select2({
            placeholder: this.props.placeholder || 'please select',
            ajax: {
                url: Meteor.absoluteUrl() + 'api/skill/search',
                dataType: 'json',
                delay: 10,
                data: function (params) {
                    return {
                        q: params.term
                    };
                },
                processResults: function (data, page) {
                    return {results: data.results};
                }

            },
            multiple: true,
            tags: true,
            cache: true
        });

        $select.on("select2:select", (e) => {
            /**
             * send request
             */
            Meteor.setTimeout(() => {
                this.props.onSelect && this.props.onSelect(e.params.data.text);
            },0);

            $select.val(null).trigger("change");
            $select.focus();
        });

    },

    render() {
        return (
            <div style={{width: '100%'}}>
                <select ref="q" style={{width: '100%'}} className="form-control" />
            </div>
        );
    }
});