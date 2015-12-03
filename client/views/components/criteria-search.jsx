const { PropTypes } = React;

CriteriaSearch = React.createClass({
    propTypes: {
        onSelect: PropTypes.func
    },

    componentDidMount() {
        const $select = $(this.refs.q.getDOMNode());
        $select.select2({
            placeholder: this.props.placeholder || 'start typing to find',
            ajax: {
                url: `${Meteor.absoluteUrl()}api/skill/${this.props.jobId}/${this.props.alias}/search/`,
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
            multiple: false,
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

        $select.on('select2:open', function() {
            $('.select2-search__field').attr('placeholder', 'Start typing to find');
        });
        $select.on("select2:close", function() {
            $('.select2-search__field').attr('placeholder', null);
        });
    },

    render() {
        return (
            <div style={{width: '100%'}}>
                <select ref="q" style={{width: '100%'}} className="form-control">
                    <option></option>
                </select>
            </div>
        );
    }
});